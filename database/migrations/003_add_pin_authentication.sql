-- Migration: Add PIN authentication
-- Replace password column with pin column

-- Add pin column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin VARCHAR(4);

-- Set default PIN '0000' for existing users without PIN
UPDATE users SET pin = '0000' WHERE pin IS NULL;

-- Make pin NOT NULL
ALTER TABLE users ALTER COLUMN pin SET NOT NULL;

-- Drop password column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS password;
