-- ============================================
-- V034: Create Flash Sales and Flash Sale Items Tables
-- ============================================

CREATE TABLE IF NOT EXISTS flash_sales (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    banner_url  VARCHAR(500),
    start_time  TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time    TIMESTAMP WITH TIME ZONE NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flash_sales_time_status ON flash_sales(start_time, end_time, status);

CREATE TABLE IF NOT EXISTS flash_sale_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flash_sale_id     UUID NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
    book_id           UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    original_price    DECIMAL(12, 2) NOT NULL,
    flash_sale_price  DECIMAL(12, 2) NOT NULL,
    discount_percent  INTEGER NOT NULL,
    quantity_limit    INTEGER NOT NULL,
    sold_quantity     INTEGER NOT NULL DEFAULT 0,
    user_limit        INTEGER NOT NULL DEFAULT 2,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_flash_sale_book UNIQUE(flash_sale_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_flash_sale_items_sale ON flash_sale_items(flash_sale_id);
CREATE INDEX IF NOT EXISTS idx_flash_sale_items_book ON flash_sale_items(book_id);
