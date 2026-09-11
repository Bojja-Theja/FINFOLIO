-- CAPSTACK Database Schema
-- Comprehensive financial wellness platform database

-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pin VARCHAR(4) NOT NULL,
    name VARCHAR(255),
    is_guest BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    monthly_income DECIMAL(12,2),
    monthly_expenses DECIMAL(12,2),
    emergency_fund DECIMAL(12,2) DEFAULT 0,
    emergency_fund_balance DECIMAL(12,2) DEFAULT 0,
    savings_rate DECIMAL(3,2) DEFAULT 0,
    total_debt DECIMAL(12,2) DEFAULT 0,
    age INTEGER,
    risk_tolerance VARCHAR(20),
    job_stability_score INTEGER DEFAULT 5,
    location VARCHAR(50),
    industry VARCHAR(100),
    experience_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Income Records
CREATE TABLE income_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- salary, freelance, business, investment, other
    frequency VARCHAR(20) NOT NULL, -- monthly, irregular
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense Records
CREATE TABLE expense_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Savings Plans
CREATE TABLE savings_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    monthly_contribution DECIMAL(12,2) DEFAULT 0,
    lock_percentage DECIMAL(3,2) DEFAULT 0, -- 0-1, how much to auto-lock
    unlock_conditions TEXT, -- JSON string of conditions
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Savings Transactions
CREATE TABLE savings_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES savings_plans(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- deposit, withdrawal, interest
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Goals
CREATE TABLE financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    target_date DATE,
    category VARCHAR(50), -- housing, retirement, education, etc.
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- mutual_fund, stocks, fd, ppf, etc.
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL, -- invested amount
    current_value DECIMAL(12,2) NOT NULL,
    returns_percentage DECIMAL(5,2),
    institution VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debts/Credit
CREATE TABLE debts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- home_loan, car_loan, credit_card, personal_loan
    lender VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL, -- total amount
    outstanding_amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2),
    emi_amount DECIMAL(12,2),
    remaining_tenure INTEGER, -- in months
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget Categories
CREATE TABLE budget_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    monthly_limit DECIMAL(12,2) NOT NULL,
    spent_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts and Notifications
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- critical, warning, info, success
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high
    category VARCHAR(50), -- savings, spending, income, emergency, investment, debt
    is_read BOOLEAN DEFAULT false,
    actionable BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    metadata TEXT, -- Additional data for the alert
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Insights (AI-generated)
CREATE TABLE financial_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- trend, opportunity, risk, achievement
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3,2), -- 0-1
    impact VARCHAR(10), -- low, medium, high
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction History (for spending analysis)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- income, expense
    category VARCHAR(50),
    description TEXT,
    date DATE NOT NULL,
    merchant VARCHAR(255),
    payment_method VARCHAR(50), -- cash, card, bank_transfer, etc.
    is_recurring BOOLEAN DEFAULT false,
    tags TEXT, -- Tags for categorization (stored as JSON)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Health Scores (historical tracking)
CREATE TABLE health_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL,
    grade VARCHAR(5) NOT NULL,
    category_scores TEXT NOT NULL, -- Detailed breakdown
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_income_records_user_id ON income_records(user_id);
CREATE INDEX idx_expense_records_user_id ON expense_records(user_id);
CREATE INDEX idx_savings_plans_user_id ON savings_plans(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_financial_insights_user_id ON financial_insights(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_health_scores_user_id ON health_scores(user_id);

-- Constraints
ALTER TABLE user_profiles ADD CONSTRAINT chk_savings_rate CHECK (savings_rate >= 0 AND savings_rate <= 1);
ALTER TABLE savings_plans ADD CONSTRAINT chk_lock_percentage CHECK (lock_percentage >= 0 AND lock_percentage <= 1);
ALTER TABLE alerts ADD CONSTRAINT chk_alert_type CHECK (type IN ('critical', 'warning', 'info', 'success'));
ALTER TABLE financial_insights ADD CONSTRAINT chk_insight_type CHECK (type IN ('trend', 'opportunity', 'risk', 'achievement'));