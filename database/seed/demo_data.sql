-- CAPSTACK Demo Data
-- Comprehensive demo dataset for testing and demonstration

-- Users
INSERT INTO users (id, email, password, name, created_at) VALUES
(1, 'demo@capstack.com', '$2b$10$hashed_password_demo', 'Demo User', '2024-01-01 00:00:00'),
(2, 'john.doe@email.com', '$2b$10$hashed_password_john', 'John Doe', '2024-01-15 00:00:00'),
(3, 'sarah.smith@email.com', '$2b$10$hashed_password_sarah', 'Sarah Smith', '2024-02-01 00:00:00');

-- User Profiles
INSERT INTO user_profiles (user_id, monthly_income, monthly_expenses, emergency_fund, savings_rate, location, industry, experience_years) VALUES
(1, 75000.00, 45000.00, 600000.00, 0.25, 'metro', 'technology', 5),
(2, 85000.00, 55000.00, 450000.00, 0.20, 'tier1', 'finance', 8),
(3, 65000.00, 38000.00, 800000.00, 0.30, 'metro', 'healthcare', 6);

-- Income Records (Last 12 months for user 1)
INSERT INTO income_records (user_id, amount, source_type, frequency, date) VALUES
(1, 75000.00, 'salary', 'monthly', '2024-01-01'),
(1, 75000.00, 'salary', 'monthly', '2024-02-01'),
(1, 75000.00, 'salary', 'monthly', '2024-03-01'),
(1, 75000.00, 'salary', 'monthly', '2024-04-01'),
(1, 75000.00, 'salary', 'monthly', '2024-05-01'),
(1, 75000.00, 'salary', 'monthly', '2024-06-01'),
(1, 75000.00, 'salary', 'monthly', '2024-07-01'),
(1, 75000.00, 'salary', 'monthly', '2024-08-01'),
(1, 75000.00, 'salary', 'monthly', '2024-09-01'),
(1, 75000.00, 'salary', 'monthly', '2024-10-01'),
(1, 75000.00, 'salary', 'monthly', '2024-11-01'),
(1, 75000.00, 'salary', 'monthly', '2024-12-01'),
-- Freelance income
(1, 10000.00, 'freelance', 'irregular', '2024-03-15'),
(1, 15000.00, 'freelance', 'irregular', '2024-07-20'),
(1, 8000.00, 'freelance', 'irregular', '2024-10-10');

-- Expense Records (Sample for user 1)
INSERT INTO expense_records (user_id, amount, category, description, date) VALUES
(1, 15000.00, 'housing', 'Rent', '2024-01-01'),
(1, 8000.00, 'food', 'Groceries and dining', '2024-01-15'),
(1, 5000.00, 'transportation', 'Fuel and maintenance', '2024-01-10'),
(1, 3000.00, 'utilities', 'Electricity and internet', '2024-01-05'),
(1, 4000.00, 'entertainment', 'Movies and subscriptions', '2024-01-20'),
(1, 2000.00, 'healthcare', 'Medical checkup', '2024-01-25'),
(1, 10000.00, 'shopping', 'Clothing and gadgets', '2024-02-01'),
-- More expense records for comprehensive data
(1, 15000.00, 'housing', 'Rent', '2024-02-01'),
(1, 7500.00, 'food', 'Monthly groceries', '2024-02-15'),
(1, 4500.00, 'transportation', 'Monthly transport', '2024-02-10'),
(1, 3200.00, 'utilities', 'Monthly bills', '2024-02-05'),
(1, 2500.00, 'entertainment', 'Streaming services', '2024-02-20');

-- Savings Plans
INSERT INTO savings_plans (user_id, name, target_amount, current_amount, monthly_contribution, lock_percentage, target_date) VALUES
(1, 'Emergency Fund', 1000000.00, 600000.00, 25000.00, 0.8, '2025-12-31'),
(1, 'Vacation Fund', 200000.00, 75000.00, 15000.00, 0.6, '2025-06-30'),
(1, 'Investment Fund', 500000.00, 150000.00, 20000.00, 0.9, '2026-12-31');

-- Savings Transactions
INSERT INTO savings_transactions (user_id, plan_id, amount, type, date) VALUES
(1, 1, 25000.00, 'deposit', '2024-01-01'),
(1, 1, 25000.00, 'deposit', '2024-02-01'),
(1, 1, 25000.00, 'deposit', '2024-03-01'),
(1, 2, 15000.00, 'deposit', '2024-01-15'),
(1, 2, 15000.00, 'deposit', '2024-02-15'),
(1, 3, 20000.00, 'deposit', '2024-01-10');

-- Financial Goals
INSERT INTO financial_goals (user_id, name, target_amount, current_amount, target_date, category) VALUES
(1, 'House Down Payment', 2000000.00, 500000.00, '2026-12-31', 'housing'),
(1, 'Retirement Fund', 50000000.00, 2000000.00, '2045-12-31', 'retirement'),
(1, 'Child Education', 10000000.00, 1000000.00, '2035-12-31', 'education');

-- Alerts and Notifications
INSERT INTO alerts (user_id, type, title, message, priority, is_read, created_at) VALUES
(1, 'warning', 'Spending Alert', 'Entertainment spending exceeded budget by 20%', 'medium', false, '2024-12-01 10:00:00'),
(1, 'info', 'Savings Milestone', 'Congratulations! You reached 60% of your emergency fund goal', 'low', false, '2024-12-05 14:30:00'),
(1, 'success', 'Financial Health Improved', 'Your financial health score increased by 5 points this month', 'low', true, '2024-12-10 09:15:00');

-- Investment Portfolio (Sample)
INSERT INTO investments (user_id, type, name, amount, current_value, returns_percentage) VALUES
(1, 'mutual_fund', 'Large Cap Fund', 100000.00, 115000.00, 15.0),
(1, 'stocks', 'Tech Stocks', 150000.00, 180000.00, 20.0),
(1, 'fd', 'Fixed Deposit', 200000.00, 210000.00, 5.0),
(1, 'ppf', 'Public Provident Fund', 50000.00, 55000.00, 10.0);

-- Credit/Debt Information
INSERT INTO debts (user_id, type, lender, amount, interest_rate, emi_amount, remaining_tenure) VALUES
(1, 'home_loan', 'Bank A', 2500000.00, 8.5, 25000.00, 240),
(1, 'car_loan', 'Bank B', 800000.00, 9.0, 12000.00, 72),
(1, 'credit_card', 'Bank C', 50000.00, 24.0, 5000.00, 12);

-- Budget Categories and Limits
INSERT INTO budget_categories (user_id, category, monthly_limit, spent_amount) VALUES
(1, 'food', 15000.00, 12000.00),
(1, 'transportation', 8000.00, 6500.00),
(1, 'entertainment', 5000.00, 6200.00),
(1, 'shopping', 10000.00, 8500.00),
(1, 'utilities', 5000.00, 4800.00),
(1, 'healthcare', 3000.00, 2000.00);

-- Financial Insights (AI-generated)
INSERT INTO financial_insights (user_id, type, category, title, description, confidence, impact, created_at) VALUES
(1, 'opportunity', 'income', 'Career Advancement', 'Based on your experience and industry growth, consider pursuing senior roles', 0.85, 'high', '2024-12-01'),
(1, 'risk', 'spending', 'Entertainment Overspending', 'Entertainment expenses 24% above recommended budget', 0.92, 'medium', '2024-12-03'),
(1, 'achievement', 'savings', 'Savings Champion', 'Maintained 25% savings rate for 6 consecutive months', 1.0, 'high', '2024-12-05'),
(1, 'trend', 'health', 'Improving Financial Health', 'Financial health score trending upward for 3 months', 0.88, 'medium', '2024-12-07');