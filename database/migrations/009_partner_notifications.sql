-- Migration 009: FinFolio Partner Notifications & Emergency Alerts
-- Phase 6: Emergency Mode & Post-Execution Accountability Notifications

CREATE TABLE IF NOT EXISTS partner_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id INTEGER REFERENCES accountability_partners(id) ON DELETE CASCADE,
    partner_email VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'emergency_withdrawal',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_notifications_user_id ON partner_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_partner_id ON partner_notifications(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_email ON partner_notifications(partner_email);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_read ON partner_notifications(read);
