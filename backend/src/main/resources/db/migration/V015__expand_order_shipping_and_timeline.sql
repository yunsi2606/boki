-- ============================================================
-- V015: Expand Order Shipping, Statuses, and Timelines
-- ============================================================

-- 1. Add RETURNED to order_status enum if not exists
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'RETURNED';

-- 2. Add shipping carrier and tracking columns to orders table
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(50),
    ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 500,
    ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
    ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS carrier_status VARCHAR(50);

-- 3. Create order_timelines table for tracking history & audit log
CREATE TABLE IF NOT EXISTS order_timelines (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL,
    status      VARCHAR(50) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    actor       VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_timelines_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE
);

-- Indexes for fast timeline lookup
CREATE INDEX IF NOT EXISTS idx_order_timelines_order_id ON order_timelines(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timelines_created_at ON order_timelines(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
