-- ============================================
-- V005: Composite & Search Indexes
-- ============================================

-- Books: composite index for filtered listing (status + category)
CREATE INDEX IF NOT EXISTS idx_books_status_category ON books(status, category_id);

-- Books: composite for seller dashboard (seller + status)
CREATE INDEX IF NOT EXISTS idx_books_seller_status ON books(seller_id, status);

-- Books: btree indexes for title/author search (ILIKE %...%)
-- Note: pg_trgm GIN indexes require superuser; use btree for portability
CREATE INDEX IF NOT EXISTS idx_books_title_text ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author_text ON books(author);

-- Orders: composite for buyer order history
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON orders(buyer_id, status);

-- Users: index for active users lookup
CREATE INDEX IF NOT EXISTS idx_users_active_email ON users(email, active);
