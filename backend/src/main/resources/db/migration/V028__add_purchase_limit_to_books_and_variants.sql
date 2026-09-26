-- ============================================
-- V028: Add purchase quantity limit to books and book_variants
-- ============================================

ALTER TABLE books
ADD COLUMN IF NOT EXISTS max_order_quantity INT DEFAULT NULL;

ALTER TABLE book_variants
ADD COLUMN IF NOT EXISTS max_order_quantity INT DEFAULT NULL;
