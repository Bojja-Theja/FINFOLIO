-- Performance Optimization: Add Indexes for Frequently Queried Columns
-- This migration adds indexes to improve query performance across the application

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Financial data indexes
CREATE INDEX IF NOT EXISTS idx_financial_data_user_id ON financial_data(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_date ON financial_data(date);
CREATE INDEX IF NOT EXISTS idx_financial_data_user_date ON financial_data(user_id, date DESC);

-- Savings locks indexes
CREATE INDEX IF NOT EXISTS idx_savings_locks_user_id ON savings_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_locks_status ON savings_locks(status);
CREATE INDEX IF NOT EXISTS idx_savings_locks_user_status ON savings_locks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_savings_locks_unlock_date ON savings_locks(unlock_date);

-- Health scores indexes
CREATE INDEX IF NOT EXISTS idx_health_scores_user_id ON health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_calculated_at ON health_scores(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_scores_user_date ON health_scores(user_id, calculated_at DESC);

-- Audit logs indexes (for security and compliance)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);

-- Session management indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE transactions;
ANALYZE financial_data;
ANALYZE savings_locks;
ANALYZE health_scores;
ANALYZE audit_logs;
ANALYZE sessions;

-- Create a function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scan BIGINT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::TEXT,
        tablename::TEXT,
        indexname::TEXT,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
    FROM pg_stat_user_indexes
    ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_index_usage_stats() IS 'Returns statistics about index usage to help identify unused indexes';
