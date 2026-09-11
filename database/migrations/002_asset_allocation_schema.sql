-- Asset Allocation Tables for CAPSTACK

-- User Financial Profiles for Benchmarking
CREATE TABLE user_financial_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    income_bracket VARCHAR(50) NOT NULL,
    age_group VARCHAR(50) NOT NULL,
    health_score INTEGER,
    survival_period DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Allocation Configuration
CREATE TABLE asset_allocations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    sip_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00, -- 20-40%
    stocks_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00, -- 10-20%
    bonds_percentage DECIMAL(5,2) NOT NULL DEFAULT 20.00, -- 10-30%
    lifestyle_percentage DECIMAL(5,2) NOT NULL DEFAULT 25.00, -- 20-40%
    emergency_fund_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- auto-adjusted
    monthly_income DECIMAL(12,2) NOT NULL,
    sip_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    stocks_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    bonds_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    lifestyle_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    emergency_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    market_risk VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (market_risk IN ('low', 'medium', 'high')),
    inflation_rate DECIMAL(5,2) DEFAULT 6.00,
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Fund Monitoring
CREATE TABLE emergency_fund_monitoring (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    target_months INTEGER NOT NULL DEFAULT 6,
    monthly_burn_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
    months_coverage DECIMAL(5,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'insufficient' CHECK (status IN ('excellent', 'good', 'adequate', 'insufficient', 'critical')),
    recommended_action TEXT,
    alerts JSONB,
    last_alert_sent TIMESTAMP,
    auto_adjustment_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investment Portfolio Tracking
CREATE TABLE investment_portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('sip', 'stocks', 'bonds', 'fd', 'ppf', 'other')),
    name VARCHAR(255) NOT NULL,
    invested_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    monthly_contribution DECIMAL(12,2) DEFAULT 0,
    expected_return_rate DECIMAL(5,2) DEFAULT 0,
    risk_level VARCHAR(10) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Trends (3-month, 6-month, 12-month)
CREATE TABLE financial_trends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR(10) NOT NULL CHECK (period IN ('3month', '6month', '12month')),
    spending_trend VARCHAR(20) NOT NULL DEFAULT 'stable' CHECK (spending_trend IN ('increasing', 'decreasing', 'stable')),
    savings_trend VARCHAR(20) NOT NULL DEFAULT 'stable' CHECK (savings_trend IN ('improving', 'declining', 'stable')),
    income_trend VARCHAR(20) NOT NULL DEFAULT 'stable' CHECK (income_trend IN ('increasing', 'decreasing', 'stable')),
    emergency_fund_trend VARCHAR(20) NOT NULL DEFAULT 'stable' CHECK (emergency_fund_trend IN ('growing', 'depleting', 'stable')),
    investment_trend VARCHAR(20) NOT NULL DEFAULT 'stable' CHECK (investment_trend IN ('growing', 'declining', 'stable')),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictive Analytics Cache
CREATE TABLE predictive_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- survival_probability, layoff_risk, savings_trajectory, etc.
    time_horizon VARCHAR(10) NOT NULL, -- 30day, 60day, 90day, 6month, 12month
    predicted_value DECIMAL(10,4),
    confidence_score DECIMAL(5,2),
    factors JSONB, -- Key factors influencing the prediction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- When to recalculate
);

-- Indexes
CREATE INDEX idx_user_financial_profiles_user_id ON user_financial_profiles(user_id);
CREATE INDEX idx_asset_allocations_user_id ON asset_allocations(user_id);
CREATE INDEX idx_emergency_fund_monitoring_user_id ON emergency_fund_monitoring(user_id);
CREATE INDEX idx_investment_portfolios_user_id ON investment_portfolios(user_id);
CREATE INDEX idx_financial_trends_user_id ON financial_trends(user_id);
CREATE INDEX idx_predictive_analytics_user_id ON predictive_analytics(user_id);

-- Constraints
ALTER TABLE asset_allocations ADD CONSTRAINT chk_percentages_total CHECK (
    sip_percentage + stocks_percentage + bonds_percentage + lifestyle_percentage + emergency_fund_percentage = 100.00
);
ALTER TABLE asset_allocations ADD CONSTRAINT chk_sip_range CHECK (sip_percentage >= 20.00 AND sip_percentage <= 40.00);
ALTER TABLE asset_allocations ADD CONSTRAINT chk_stocks_range CHECK (stocks_percentage >= 10.00 AND stocks_percentage <= 20.00);
ALTER TABLE asset_allocations ADD CONSTRAINT chk_bonds_range CHECK (bonds_percentage >= 10.00 AND bonds_percentage <= 30.00);
ALTER TABLE asset_allocations ADD CONSTRAINT chk_lifestyle_range CHECK (lifestyle_percentage >= 20.00 AND lifestyle_percentage <= 40.00);