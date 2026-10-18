-- ====================================================
-- V042: Widen tier_rank length to support custom tier names with spaces
-- ====================================================

ALTER TABLE manga_tier_list_items
    ALTER COLUMN tier_rank TYPE VARCHAR(100);
