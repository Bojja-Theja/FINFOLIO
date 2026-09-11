-- Migration to synchronize schema with DatabaseService logic
-- Added missing columns for user_profiles, emergency_fund_monitoring, and asset_allocations

-- 1. Update user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS emergency_fund_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_debt DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS risk_tolerance VARCHAR(20),
ADD COLUMN IF NOT EXISTS job_stability_score INTEGER DEFAULT 5;

-- 2. Update emergency_fund_monitoring
ALTER TABLE emergency_fund_monitoring
ADD COLUMN IF NOT EXISTS recommended_action TEXT,
ADD COLUMN IF NOT EXISTS alerts JSONB;

-- 3. Update asset_allocations
ALTER TABLE asset_allocations
ADD COLUMN IF NOT EXISTS sip_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stocks_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonds_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifestyle_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS emergency_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reasoning TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Cleanup old names if they exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='asset_allocations' AND column_name='allocated_sip') THEN
        ALTER TABLE asset_allocations RENAME COLUMN allocated_sip TO sip_amount;
        ALTER TABLE asset_allocations RENAME COLUMN allocated_stocks TO stocks_amount;
        ALTER TABLE asset_allocations RENAME COLUMN allocated_bonds TO bonds_amount;
        ALTER TABLE asset_allocations RENAME COLUMN allocated_lifestyle TO lifestyle_amount;
        ALTER TABLE asset_allocations RENAME COLUMN allocated_emergency TO emergency_amount;
    END IF;
END $$;
