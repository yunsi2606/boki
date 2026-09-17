-- ============================================
-- V013: Add rating, views_count, reviews_count, original_price to books
-- ============================================

ALTER TABLE books ADD COLUMN IF NOT EXISTS original_price NUMERIC(12, 2);
ALTER TABLE books ADD COLUMN IF NOT EXISTS views_count INT NOT NULL DEFAULT 0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS reviews_count INT NOT NULL DEFAULT 0;

-- Update existing books with realistic initial views and rating numbers
UPDATE books SET views_count = 128, rating = 4.9, reviews_count = 14 WHERE views_count = 0;
