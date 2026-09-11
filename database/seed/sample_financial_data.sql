-- Sample Financial Data for CAPSTACK
-- Based on the master prompt requirements

-- Insert sample user
INSERT INTO users (email, pin, name, created_at, updated_at) VALUES
('demo@capstack.com', '1234', 'Demo User', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Get user ID
-- Note: In a real scenario, you'd use the actual user ID

-- Insert user profile
INSERT INTO user_profiles (user_id, monthly_income, monthly_expenses, emergency_fund, savings_rate, location, industry, experience_years, created_at, updated_at) VALUES
(1, 52000, 31000, 45000, 0.20, 'Mumbai', 'IT', 3, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
  monthly_income = EXCLUDED.monthly_income,
  monthly_expenses = EXCLUDED.monthly_expenses,
  emergency_fund = EXCLUDED.emergency_fund,
  savings_rate = EXCLUDED.savings_rate,
  updated_at = NOW();

-- Insert income records
INSERT INTO income_records (user_id, amount, source_type, frequency, date, description, created_at) VALUES
(1, 52000, 'salary', 'monthly', CURRENT_DATE, 'Monthly salary from IT job', NOW()),
(1, 5000, 'freelance', 'irregular', CURRENT_DATE - INTERVAL '15 days', 'Freelance project payment', NOW())
ON CONFLICT DO NOTHING;

-- Insert expense records
INSERT INTO expense_records (user_id, amount, category, description, date, is_recurring, created_at) VALUES
(1, 7000, 'housing', 'Rent payment', CURRENT_DATE, true, NOW()),
(1, 5000, 'debt', 'EMI payment', CURRENT_DATE, true, NOW()),
(1, 6000, 'food', 'Groceries and dining', CURRENT_DATE, true, NOW()),
(1, 4000, 'lifestyle', 'Entertainment and shopping', CURRENT_DATE, true, NOW()),
(1, 3000, 'transportation', 'Commute and fuel', CURRENT_DATE, true, NOW()),
(1, 2000, 'utilities', 'Electricity and internet', CURRENT_DATE, true, NOW()),
(1, 3000, 'healthcare', 'Medical expenses', CURRENT_DATE, false, NOW())
ON CONFLICT DO NOTHING;

-- Insert asset allocation
INSERT INTO asset_allocations (
  user_id, sip_percentage, stocks_percentage, bonds_percentage,
  lifestyle_percentage, emergency_fund_percentage, monthly_income,
  allocated_sip, allocated_stocks, allocated_bonds, allocated_lifestyle, allocated_emergency,
  market_risk, inflation_rate, job_stability_score, last_updated, created_at
) VALUES (
  1, 30.00, 15.00, 20.00, 25.00, 10.00, 52000,
  15600, 7800, 10400, 13000, 5200,
  'medium', 6.00, 7.00, NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  sip_percentage = EXCLUDED.sip_percentage,
  stocks_percentage = EXCLUDED.stocks_percentage,
  bonds_percentage = EXCLUDED.bonds_percentage,
  lifestyle_percentage = EXCLUDED.lifestyle_percentage,
  emergency_fund_percentage = EXCLUDED.emergency_fund_percentage,
  allocated_sip = EXCLUDED.allocated_sip,
  allocated_stocks = EXCLUDED.allocated_stocks,
  allocated_bonds = EXCLUDED.allocated_bonds,
  allocated_lifestyle = EXCLUDED.allocated_lifestyle,
  allocated_emergency = EXCLUDED.allocated_emergency,
  last_updated = NOW();

-- Insert emergency fund monitoring
INSERT INTO emergency_fund_monitoring (
  user_id, current_balance, target_months, monthly_burn_rate, months_coverage,
  status, auto_adjustment_enabled, created_at, updated_at
) VALUES (
  1, 45000, 6, 31000, 1.45, 'insufficient', true, NOW(), NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  current_balance = EXCLUDED.current_balance,
  months_coverage = EXCLUDED.months_coverage,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert investment portfolios
INSERT INTO investment_portfolios (
  user_id, asset_type, name, invested_amount, current_value, monthly_contribution,
  expected_return_rate, risk_level, created_at, updated_at
) VALUES
(1, 'sip', 'HDFC Small Cap Fund', 50000, 55000, 5000, 12.00, 'high', NOW(), NOW()),
(1, 'stocks', 'Direct Equity Portfolio', 30000, 32000, 2000, 10.00, 'high', NOW(), NOW()),
(1, 'bonds', 'Corporate Bond Fund', 25000, 25500, 3000, 6.00, 'medium', NOW(), NOW()),
(1, 'fd', 'Fixed Deposit', 20000, 20200, 0, 5.00, 'low', NOW(), NOW())
ON CONFLICT (user_id, name) DO UPDATE SET
  invested_amount = EXCLUDED.invested_amount,
  current_value = EXCLUDED.current_value,
  updated_at = NOW();

-- Insert debts
INSERT INTO debts (
  user_id, type, lender, amount, outstanding_amount, interest_rate,
  emi_amount, remaining_tenure, created_at, updated_at
) VALUES
(1, 'personal_loan', 'HDFC Bank', 100000, 80000, 12.50, 5000, 24, NOW(), NOW()),
(1, 'credit_card', 'SBI Credit Card', 50000, 15000, 24.00, 2000, 12, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert financial goals
INSERT INTO financial_goals (
  user_id, name, target_amount, current_amount, target_date, category, priority, created_at, updated_at
) VALUES
(1, 'Emergency Fund', 186000, 45000, CURRENT_DATE + INTERVAL '12 months', 'emergency', 'high', NOW(), NOW()),
(1, 'House Down Payment', 500000, 100000, CURRENT_DATE + INTERVAL '24 months', 'housing', 'medium', NOW(), NOW()),
(1, 'Vacation Fund', 100000, 25000, CURRENT_DATE + INTERVAL '6 months', 'lifestyle', 'low', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert alerts
INSERT INTO alerts (
  user_id, type, title, message, priority, category, actionable, metadata, created_at
) VALUES
(1, 'warning', 'Emergency Fund Low', 'Your emergency fund covers only 1.5 months of expenses. Target is 6 months.', 'high', 'emergency', true, '{"recommended_action": "increase_savings"}', NOW()),
(1, 'info', 'SIP Consistency', 'Great job maintaining your SIP investments this month!', 'medium', 'investment', false, '{"achievement": "sip_consistency"}', NOW()),
(1, 'critical', 'High Debt Ratio', 'Your debt-to-income ratio is 23%. Consider debt consolidation.', 'high', 'debt', true, '{"debt_ratio": 23}', NOW())
ON CONFLICT DO NOTHING;

-- Insert financial insights
INSERT INTO financial_insights (
  user_id, type, category, title, description, confidence, impact, recommendations, created_at
) VALUES
(1, 'opportunity', 'savings', 'Increase Emergency Fund', 'Building emergency fund to 6 months coverage will improve financial stability', 0.85, 'high', ARRAY['Increase monthly savings by ₹5000', 'Cut non-essential expenses', 'Consider side income'], NOW()),
(1, 'risk', 'debt', 'Debt Management', 'High debt burden affecting savings capacity', 0.75, 'medium', ARRAY['Consolidate high-interest debt', 'Increase EMI payments', 'Avoid new debt'], NOW()),
(1, 'achievement', 'investment', 'SIP Milestone', 'Completed 6 months of consistent SIP investments', 0.95, 'medium', ARRAY['Continue SIP discipline', 'Consider increasing SIP amount', 'Diversify investments'], NOW())
ON CONFLICT DO NOTHING;

-- Insert trend data
INSERT INTO financial_trends (
  user_id, period, spending_trend, savings_trend, income_trend,
  emergency_fund_trend, investment_trend, calculated_at
) VALUES
(1, '3month', 'stable', 'improving', 'stable', 'growing', 'stable', NOW()),
(1, '6month', 'decreasing', 'improving', 'increasing', 'growing', 'growing', NOW()),
(1, '12month', 'stable', 'stable', 'stable', 'stable', 'stable', NOW())
ON CONFLICT (user_id, period) DO UPDATE SET
  spending_trend = EXCLUDED.spending_trend,
  savings_trend = EXCLUDED.savings_trend,
  calculated_at = NOW();