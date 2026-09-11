-- Migration: Add missing indexes for performance optimization

-- Missing user_id indexes
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_savings_transactions_user_id ON savings_transactions(user_id);
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_budget_categories_user_id ON budget_categories(user_id);

-- Composite indexes on transaction tables for queries by user and date
CREATE INDEX idx_transactions_user_id_date ON transactions(user_id, date);
CREATE INDEX idx_savings_transactions_user_id_date ON savings_transactions(user_id, date);
CREATE INDEX idx_income_records_user_id_date ON income_records(user_id, date);
CREATE INDEX idx_expense_records_user_id_date ON expense_records(user_id, date);

-- Composite index for health scores by user and date
CREATE INDEX idx_health_scores_user_id_date ON health_scores(user_id, date);

-- Composite index for alerts by user and read status
CREATE INDEX idx_alerts_user_id_is_read ON alerts(user_id, is_read);