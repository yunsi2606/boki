-- V031: Add tables for Recommendation Engine

-- 1. Book Similarity Matrix (Precomputed content-based similarities)
CREATE TABLE IF NOT EXISTS book_similarities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    target_book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5, 4) NOT NULL,
    reason_code VARCHAR(50) NOT NULL,
    reason_label VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_book_similarity UNIQUE(source_book_id, target_book_id)
);

CREATE INDEX IF NOT EXISTS idx_book_similarities_source ON book_similarities(source_book_id, similarity_score DESC);

-- 2. Book Co-occurrences (Co-purchased in orders and viewed in same sessions)
CREATE TABLE IF NOT EXISTS book_co_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_a_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    book_b_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    co_order_count INT NOT NULL DEFAULT 1,
    co_view_count INT NOT NULL DEFAULT 0,
    confidence_score DECIMAL(5, 4) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_book_co_occurrence UNIQUE(book_a_id, book_b_id)
);

CREATE INDEX IF NOT EXISTS idx_book_co_occurrences_a ON book_co_occurrences(book_a_id, confidence_score DESC);

-- 3. User & Session Interest Profiles (Aggregated category & author weights from activities)
CREATE TABLE IF NOT EXISTS user_interest_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(64),
    top_categories_json JSONB DEFAULT '{}'::jsonb,
    top_authors_json JSONB DEFAULT '{}'::jsonb,
    recent_viewed_book_ids JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_interest_user_id ON user_interest_profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_interest_session_id ON user_interest_profiles(session_id);

-- 4. Recommendation Interaction & Conversion Tracking Logs
CREATE TABLE IF NOT EXISTS recommendation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id VARCHAR(64) NOT NULL,
    widget_type VARCHAR(50) NOT NULL,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    position_index INT NOT NULL DEFAULT 0,
    is_clicked BOOLEAN DEFAULT FALSE,
    is_converted_to_cart BOOLEAN DEFAULT FALSE,
    is_converted_to_order BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rec_logs_widget_created ON recommendation_logs(widget_type, created_at);
CREATE INDEX IF NOT EXISTS idx_rec_logs_session_book ON recommendation_logs(session_id, book_id);
