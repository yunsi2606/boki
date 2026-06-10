-- ============================================
-- V003: Books & Book Images
-- ============================================

CREATE TYPE book_condition AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE book_status AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED');

CREATE TABLE books (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id       UUID NOT NULL,
    category_id     INTEGER,
    title           VARCHAR(255) NOT NULL,
    author          VARCHAR(255) NOT NULL,
    isbn            VARCHAR(20),
    description     TEXT,
    price           DECIMAL(12, 2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'VND',
    condition       book_condition NOT NULL DEFAULT 'GOOD',
    status          book_status NOT NULL DEFAULT 'DRAFT',
    stock_quantity  INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),

    CONSTRAINT fk_books_seller FOREIGN KEY (seller_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT chk_books_price_positive CHECK (price >= 0),
    CONSTRAINT chk_books_stock_non_negative CHECK (stock_quantity >= 0)
);

CREATE TABLE book_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id     UUID NOT NULL,
    image_url   VARCHAR(500) NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_book_images_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_books_seller ON books(seller_id);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_book_images_book ON book_images(book_id);

-- Auto-update trigger
CREATE TRIGGER trg_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
