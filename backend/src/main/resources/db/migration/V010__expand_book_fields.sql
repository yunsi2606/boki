-- ============================================
-- V010: Expand Books metadata fields (Publisher, Supplier, Year, Language, etc.)
-- ============================================

ALTER TABLE books
    ADD COLUMN publisher VARCHAR(255),
    ADD COLUMN supplier VARCHAR(255),
    ADD COLUMN publication_year INTEGER,
    ADD COLUMN language VARCHAR(50),
    ADD COLUMN format VARCHAR(50),
    ADD COLUMN number_of_pages INTEGER,
    ADD COLUMN weight_grams INTEGER,
    ADD COLUMN dimensions VARCHAR(100),
    ADD COLUMN translator VARCHAR(255);
