-- ============================================
-- V012: Add slug column to books table for SEO URLs
-- ============================================

ALTER TABLE books ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
