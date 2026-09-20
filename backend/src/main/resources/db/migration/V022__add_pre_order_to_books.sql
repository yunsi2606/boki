-- Migration V022: Add pre-order support to books
ALTER TABLE books
ADD COLUMN IF NOT EXISTS is_pre_order BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pre_order_days INTEGER NULL;
