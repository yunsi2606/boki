-- ============================================================
-- V016: Add Payment Methods, Statuses, and Payments Table
-- ============================================================

-- 1. Add payment tracking columns to orders table
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NOT NULL DEFAULT 'COD',
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN IF NOT EXISTS payment_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Generate initial payment_code for existing orders if empty
UPDATE orders
SET payment_code = 'BOKI' || UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
WHERE payment_code IS NULL;

-- 2. Create payments table for storing transaction logs
CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL,
    payment_method      VARCHAR(30) NOT NULL,
    payment_status      VARCHAR(30) NOT NULL,
    amount              DECIMAL(12, 2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'VND',
    transaction_code    VARCHAR(100),
    payment_code        VARCHAR(50),
    gateway_response    TEXT,
    paid_at             TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payments_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_orders_payment_code ON orders(payment_code);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_code ON payments(transaction_code);

-- 4. Seed initial default payment configurations in store_config
INSERT INTO store_config (config_key, config_value)
VALUES 
    ('sepay_bank_code', 'MBBank'),
    ('sepay_account_number', '0868889999'),
    ('sepay_account_name', 'CONG TY CO PHAN BOKI STORE'),
    ('sepay_api_key', 'BOKI_SEPAY_SECURE_TOKEN_2026'),
    ('momo_partner_code', 'MOMO'),
    ('momo_access_key', 'F8BBA842ECF85'),
    ('momo_secret_key', 'K951B6PE1waDMi640xX0huIC1kAEdaBs'),
    ('momo_sandbox_enabled', 'true'),
    ('vnpay_tmn_code', 'BOKIST01'),
    ('vnpay_hash_secret', 'BOKIVNPAYSECRETKEYHASH2026XYZABC'),
    ('vnpay_sandbox_enabled', 'true')
ON CONFLICT (config_key) DO NOTHING;
