-- ============================================
-- V014: Expand vouchers table with rich condition fields
-- ============================================

ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS discount_type VARCHAR(30) NOT NULL DEFAULT 'FIXED_AMOUNT';
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(12, 2);
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS user_usage_limit INT NOT NULL DEFAULT 1;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS applicable_category_id INT;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS applicable_category_name VARCHAR(100);
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS user_scope VARCHAR(30) NOT NULL DEFAULT 'ALL';
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Update existing seeded vouchers with rich conditions
UPDATE vouchers SET discount_type = 'FREE_SHIPPING', max_discount_amount = 25000, user_usage_limit = 2 WHERE code = 'FREESHIP20';
UPDATE vouchers SET discount_type = 'FIXED_AMOUNT', min_order_amount = 200000, user_usage_limit = 1 WHERE code = 'BOKI20K';
UPDATE vouchers SET discount_type = 'FIXED_AMOUNT', min_order_amount = 99000, user_usage_limit = 3 WHERE code = 'BOKI10K';
