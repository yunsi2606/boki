-- ============================================
-- V005: Composite & Search Indexes
-- ============================================

-- Books: composite index for filtered listing (status + category)
CREATE INDEX idx_books_status_category ON books(status, category_id);

-- Books: composite for seller dashboard (seller + status)
CREATE INDEX idx_books_seller_status ON books(seller_id, status);

-- Books: full-text search support on title and author
CREATE INDEX idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
CREATE INDEX idx_books_author_trgm ON books USING gin (author gin_trgm_ops);

-- Orders: composite for buyer order history
CREATE INDEX idx_orders_buyer_status ON orders(buyer_id, status);

-- Users: partial index for active users only
CREATE INDEX idx_users_active_email ON users(email) WHERE active = TRUE;
