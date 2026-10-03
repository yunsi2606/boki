-- V033: Add category_cover_url to books
-- Used specifically for clean 3D book covers in category views without accessories/gifts.
ALTER TABLE books ADD COLUMN IF NOT EXISTS category_cover_url VARCHAR(500);
