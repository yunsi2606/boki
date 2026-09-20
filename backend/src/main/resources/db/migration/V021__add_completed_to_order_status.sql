-- Add COMPLETED to order_status enum if not exists
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'COMPLETED';
