-- =========================================================================
-- V020: Add User Profile Shipping Address and Member Tier Expiry Fields
-- =========================================================================

-- 1. Add Tier Lifecycle / Expiry columns to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS tier_upgraded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '365 days'),
    ADD COLUMN IF NOT EXISTS cycle_spent NUMERIC(14, 2) NOT NULL DEFAULT 0;

-- 2. Add Default Shipping Address columns to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS shipping_full_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS shipping_province VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_province_code INT,
    ADD COLUMN IF NOT EXISTS shipping_district VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_district_code INT,
    ADD COLUMN IF NOT EXISTS shipping_ward VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_ward_code INT,
    ADD COLUMN IF NOT EXISTS shipping_street_address VARCHAR(255),
    ADD COLUMN IF NOT EXISTS shipping_delivery_note VARCHAR(500);

-- 3. Backfill cycle_spent with total_spent for existing users
UPDATE users
SET cycle_spent = total_spent
WHERE cycle_spent = 0 AND total_spent > 0;

-- 4. Create index for tier expiry checking
CREATE INDEX IF NOT EXISTS idx_users_tier_expires_at ON users(tier_expires_at);
