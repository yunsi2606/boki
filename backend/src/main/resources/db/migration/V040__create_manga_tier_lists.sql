-- ============================================
-- V040: Create Manga Tier Lists and Seed Data
-- ============================================

CREATE TABLE IF NOT EXISTS manga_tier_lists (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    is_public     BOOLEAN NOT NULL DEFAULT TRUE,
    likes_count   INTEGER NOT NULL DEFAULT 0,
    views_count   INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manga_tier_list_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_list_id  UUID NOT NULL REFERENCES manga_tier_lists(id) ON DELETE CASCADE,
    schedule_id   UUID NOT NULL REFERENCES release_schedules(id) ON DELETE CASCADE,
    tier_rank     VARCHAR(20) NOT NULL DEFAULT 'S', -- S, A, B, C, D
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manga_tier_lists_user ON manga_tier_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_manga_tier_lists_public ON manga_tier_lists(is_public);
CREATE INDEX IF NOT EXISTS idx_manga_tier_list_items_list ON manga_tier_list_items(tier_list_id);

-- Seed user accounts for community creators
INSERT INTO users (id, email, display_name, phone_verified, role, email_verified, active)
VALUES 
    ('a1111111-1111-1111-1111-111111111001'::uuid, 'jayroring2013@boki.vn', 'jayroring2013', true, 'BUYER', true, true),
    ('a1111111-1111-1111-1111-111111111002'::uuid, 'stuip21@boki.vn', 'stuip21', true, 'BUYER', true, true),
    ('a1111111-1111-1111-1111-111111111003'::uuid, 'wuwamaster1512@boki.vn', 'wuwamaster1512', true, 'BUYER', true, true),
    ('a1111111-1111-1111-1111-111111111004'::uuid, 'daihuuuuu@boki.vn', 'daihuuuuu', true, 'BUYER', true, true)
ON CONFLICT (email) DO NOTHING;

-- Seed 4 public tier lists
INSERT INTO manga_tier_lists (id, user_id, title, description, is_public, likes_count, created_at)
VALUES 
    ('b1111111-1111-1111-1111-111111111001'::uuid, 'a1111111-1111-1111-1111-111111111001'::uuid, 'Hyd Manga List', 'Tuyển chọn các tác phẩm shonen và hành động đỉnh cao', true, 142, NOW() - INTERVAL '4 days'),
    ('b1111111-1111-1111-1111-111111111002'::uuid, 'a1111111-1111-1111-1111-111111111002'::uuid, 'lưu lại kỉ niệm', 'Bộ sưu tập kỷ niệm những bộ truyện gắn liền tuổi thơ', true, 89, TIMESTAMPTZ '2026-10-07 10:00:00+07'),
    ('b1111111-1111-1111-1111-111111111003'::uuid, 'a1111111-1111-1111-1111-111111111003'::uuid, 'my collection', 'Những bộ manga tâm đắc đang theo dõi', true, 56, TIMESTAMPTZ '2026-10-05 15:30:00+07'),
    ('b1111111-1111-1111-1111-111111111004'::uuid, 'a1111111-1111-1111-1111-111111111004'::uuid, 'lửng mật', 'Danh sách đang xây dựng', true, 12, TIMESTAMPTZ '2026-09-26 09:00:00+07')
ON CONFLICT (id) DO NOTHING;

-- Seed items for tier list 1 (Hyd Manga List - 9 truyện)
INSERT INTO manga_tier_list_items (tier_list_id, schedule_id, tier_rank, sort_order)
SELECT 'b1111111-1111-1111-1111-111111111001'::uuid, id, 'S', ROW_NUMBER() OVER ()
FROM release_schedules
ORDER BY created_at DESC
LIMIT 9;

-- Seed items for tier list 2 (lưu lại kỉ niệm - 64 truyện or up to available)
INSERT INTO manga_tier_list_items (tier_list_id, schedule_id, tier_rank, sort_order)
SELECT 'b1111111-1111-1111-1111-111111111002'::uuid, id, 'A', ROW_NUMBER() OVER ()
FROM release_schedules
ORDER BY release_date ASC
LIMIT 64;

-- Seed items for tier list 3 (my collection - 4 truyện)
INSERT INTO manga_tier_list_items (tier_list_id, schedule_id, tier_rank, sort_order)
SELECT 'b1111111-1111-1111-1111-111111111003'::uuid, id, 'S', ROW_NUMBER() OVER ()
FROM release_schedules
ORDER BY title ASC
LIMIT 4;

-- tier list 4 (lửng mật) has 0 truyện (empty)
