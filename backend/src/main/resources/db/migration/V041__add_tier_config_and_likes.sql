-- ====================================================
-- V041: Add Tiers Config and Likes to Manga Tier Lists
-- ====================================================

ALTER TABLE manga_tier_lists
    ADD COLUMN IF NOT EXISTS tiers_config TEXT DEFAULT '[{"name":"S","color":"#EE4D2D"},{"name":"A","color":"#FF9800"},{"name":"B","color":"#F59F00"},{"name":"C","color":"#10B981"},{"name":"D","color":"#06B6D4"},{"name":"E","color":"#6366F1"},{"name":"F","color":"#6B7280"}]';

CREATE TABLE IF NOT EXISTS manga_tier_list_likes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier_list_id  UUID NOT NULL REFERENCES manga_tier_lists(id) ON DELETE CASCADE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_manga_tier_list_like UNIQUE (user_id, tier_list_id)
);

CREATE INDEX IF NOT EXISTS idx_manga_tier_list_likes_list ON manga_tier_list_likes(tier_list_id);
CREATE INDEX IF NOT EXISTS idx_manga_tier_list_likes_user ON manga_tier_list_likes(user_id);
