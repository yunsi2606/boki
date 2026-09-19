-- ============================================================
-- V017: Add Fraud Detection and Autopilot Order Management
-- ============================================================

-- 1. Add fraud detection and guest checkout tracking columns to orders table
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'SAFE',
    ADD COLUMN IF NOT EXISTS risk_reasons TEXT,
    ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);

-- 2. Allow buyer_id to be nullable for pure guest orders and seed guest user account
ALTER TABLE orders ALTER COLUMN buyer_id DROP NOT NULL;

INSERT INTO users (id, email, display_name, phone_verified, role, email_verified, active)
VALUES ('00000000-0000-0000-0000-000000000001', 'guest@boki.com', 'Khách vãng lai', true, 'BUYER', true, true)
ON CONFLICT (email) DO NOTHING;

-- 3. Create index on is_flagged and risk_level for quick querying of suspicious orders
CREATE INDEX IF NOT EXISTS idx_orders_is_flagged ON orders(is_flagged);
CREATE INDEX IF NOT EXISTS idx_orders_risk_level ON orders(risk_level);
CREATE INDEX IF NOT EXISTS idx_orders_is_guest ON orders(is_guest);

-- 4. Seed default configurations for fraud detection and autopilot in store_config
INSERT INTO store_config (config_key, config_value)
VALUES 
    ('autopilot_enabled', 'true'),
    ('fraud_guest_max_amount', '1500000'),
    ('fraud_cod_max_amount', '2000000'),
    ('fraud_risk_threshold', '60'),
    ('fraud_voice_alert_enabled', 'true')
ON CONFLICT (config_key) DO NOTHING;
