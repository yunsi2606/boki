-- ============================================
-- V032: Multi-category support for Books & Combos
-- ============================================

CREATE TABLE IF NOT EXISTS book_categories (
    book_id     UUID NOT NULL,
    category_id INTEGER NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_book_categories PRIMARY KEY (book_id, category_id),
    CONSTRAINT fk_book_categories_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_book_categories_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_book_categories_book_id ON book_categories(book_id);
CREATE INDEX IF NOT EXISTS idx_book_categories_category_id ON book_categories(category_id);

-- Backfill existing books' category_id into book_categories
INSERT INTO book_categories (book_id, category_id)
SELECT id, category_id
FROM books
WHERE category_id IS NOT NULL
ON CONFLICT (book_id, category_id) DO NOTHING;
