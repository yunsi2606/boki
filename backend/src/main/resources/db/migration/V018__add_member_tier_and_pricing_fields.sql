-- ============================================================
-- V018: Add Member Tier, Total Spent, and Server Pricing Fields
-- ============================================================

-- 1. Add Member Tier & Loyalty columns to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS member_tier VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN IF NOT EXISTS total_spent NUMERIC(14, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS loyalty_points INT NOT NULL DEFAULT 0;

-- 2. Add Server Pricing Breakdown columns to orders table
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS member_tier VARCHAR(30) DEFAULT 'STANDARD',
    ADD COLUMN IF NOT EXISTS member_discount_amount NUMERIC(14, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS voucher_discount_amount NUMERIC(14, 2) DEFAULT 0;

-- 3. Populate existing orders subtotal_amount with total_amount if null
UPDATE orders SET subtotal_amount = total_amount WHERE subtotal_amount IS NULL;

-- 4. Create indexes for quick tier and voucher queries
CREATE INDEX IF NOT EXISTS idx_users_member_tier ON users(member_tier);
CREATE INDEX IF NOT EXISTS idx_orders_voucher_code ON orders(voucher_code);
