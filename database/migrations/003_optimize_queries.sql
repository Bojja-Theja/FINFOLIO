-- Query Optimization: Materialized Views and Optimized Queries
-- This migration creates materialized views for complex analytics queries

-- Materialized view for user financial summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_financial_summary AS
SELECT 
    u.id AS user_id,
    u.email,
    COUNT(DISTINCT t.id) AS total_transactions,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) AS net_balance,
    COALESCE(AVG(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS avg_expense,
    MAX(t.created_at) AS last_transaction_date,
    (SELECT score FROM health_scores WHERE user_id = u.id ORDER BY calculated_at DESC LIMIT 1) AS latest_health_score
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.email;

CREATE UNIQUE INDEX idx_mv_user_financial_summary_user_id ON mv_user_financial_summary(user_id);

-- Materialized view for monthly analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_analytics AS
SELECT 
    user_id,
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS transaction_count,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS monthly_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS monthly_expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS monthly_net,
    AVG(CASE WHEN type = 'expense' THEN amount END) AS avg_expense_amount,
    COUNT(DISTINCT category) AS unique_categories
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', created_at);

CREATE INDEX idx_mv_monthly_analytics_user_month ON mv_monthly_analytics(user_id, month DESC);

-- Materialized view for category breakdown
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_breakdown AS
SELECT 
    user_id,
    category,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount,
    DATE_TRUNC('month', MAX(created_at)) AS last_transaction_month
FROM transactions
WHERE type = 'expense'
GROUP BY user_id, category;

CREATE INDEX idx_mv_category_breakdown_user ON mv_category_breakdown(user_id);
CREATE INDEX idx_mv_category_breakdown_category ON mv_category_breakdown(category);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_financial_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_breakdown;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_materialized_views() IS 'Refreshes all materialized views concurrently';

-- Create a scheduled job to refresh materialized views (requires pg_cron extension)
-- This should be run manually or via cron job
-- SELECT cron.schedule('refresh-materialized-views', '*/5 * * * *', 'SELECT refresh_all_materialized_views()');

-- Optimized query for getting user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard_data(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_id', user_id,
        'total_income', total_income,
        'total_expenses', total_expenses,
        'net_balance', net_balance,
        'avg_expense', avg_expense,
        'total_transactions', total_transactions,
        'last_transaction_date', last_transaction_date,
        'health_score', latest_health_score,
        'recent_transactions', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT id, amount, category, type, description, created_at
                FROM transactions
                WHERE user_id = p_user_id
                ORDER BY created_at DESC
                LIMIT 10
            ) t
        ),
        'monthly_summary', (
            SELECT json_agg(row_to_json(m))
            FROM (
                SELECT month, monthly_income, monthly_expenses, monthly_net
                FROM mv_monthly_analytics
                WHERE user_id = p_user_id
                ORDER BY month DESC
                LIMIT 12
            ) m
        ),
        'category_breakdown', (
            SELECT json_agg(row_to_json(c))
            FROM (
                SELECT category, total_amount, transaction_count
                FROM mv_category_breakdown
                WHERE user_id = p_user_id
                ORDER BY total_amount DESC
                LIMIT 10
            ) c
        )
    ) INTO result
    FROM mv_user_financial_summary
    WHERE user_id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_dashboard_data(INTEGER) IS 'Returns comprehensive dashboard data for a user in a single query';

-- Analyze tables after creating materialized views
ANALYZE mv_user_financial_summary;
ANALYZE mv_monthly_analytics;
ANALYZE mv_category_breakdown;
