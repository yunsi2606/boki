-- ============================================
-- V030: Add Book Combo support and book_combo_items table
-- ============================================

-- Add is_combo flag to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS is_combo BOOLEAN NOT NULL DEFAULT FALSE;

-- Create table book_combo_items
CREATE TABLE IF NOT EXISTS book_combo_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_book_id   UUID NOT NULL,
    single_book_id  UUID NOT NULL,
    variant_id      UUID,
    quantity        INTEGER NOT NULL DEFAULT 1,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_combo_items_combo FOREIGN KEY (combo_book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_combo_items_single FOREIGN KEY (single_book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_combo_items_variant FOREIGN KEY (variant_id)
        REFERENCES book_variants(id) ON DELETE SET NULL,
    CONSTRAINT chk_combo_item_quantity CHECK (quantity > 0)
);

-- Unique index to prevent duplicate single book / variant inside the same combo
CREATE UNIQUE INDEX IF NOT EXISTS uq_combo_items_book_variant ON book_combo_items (
    combo_book_id,
    single_book_id,
    COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_combo_items_combo_id ON book_combo_items(combo_book_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_single_id ON book_combo_items(single_book_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_variant_id ON book_combo_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_books_is_combo ON books(is_combo);
