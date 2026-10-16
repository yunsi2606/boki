-- ============================================
-- V038: Expand Release Schedule Ecosystem
-- ============================================

-- 1. Add series, volume, and slug fields to release_schedules
ALTER TABLE release_schedules ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE release_schedules ADD COLUMN IF NOT EXISTS series_name VARCHAR(255);
ALTER TABLE release_schedules ADD COLUMN IF NOT EXISTS series_slug VARCHAR(255);
ALTER TABLE release_schedules ADD COLUMN IF NOT EXISTS volume_number INTEGER;
ALTER TABLE release_schedules ADD COLUMN IF NOT EXISTS total_volumes INTEGER;

-- Generate clean slugs for existing release_schedules
UPDATE release_schedules SET 
    slug = 'chu-thuat-hoi-chien-tap-25',
    series_name = 'Chú Thuật Hồi Chiến',
    series_slug = 'chu-thuat-hoi-chien',
    volume_number = 25,
    total_volumes = 28
WHERE id = '88888888-8888-8888-8888-888888888001'::uuid;

UPDATE release_schedules SET 
    slug = 'one-piece-tap-108',
    series_name = 'One Piece',
    series_slug = 'one-piece',
    volume_number = 108,
    total_volumes = 110
WHERE id = '88888888-8888-8888-8888-888888888002'::uuid;

UPDATE release_schedules SET 
    slug = 'spy-x-family-tap-13',
    series_name = 'Spy x Family',
    series_slug = 'spy-x-family',
    volume_number = 13,
    total_volumes = 14
WHERE id = '88888888-8888-8888-8888-888888888003'::uuid;

UPDATE release_schedules SET 
    slug = 'gokurakugai-tap-2',
    series_name = 'Gokurakugai',
    series_slug = 'gokurakugai',
    volume_number = 2,
    total_volumes = 4
WHERE id = '88888888-8888-8888-8888-888888888004'::uuid;

UPDATE release_schedules SET 
    slug = 'frieren-tap-12',
    series_name = 'Frieren - Pháp Sư Tiễn Táng',
    series_slug = 'frieren',
    volume_number = 12,
    total_volumes = 13
WHERE id = '88888888-8888-8888-8888-888888888005'::uuid;

UPDATE release_schedules SET 
    slug = 'blue-lock-tap-27',
    series_name = 'Blue Lock',
    series_slug = 'blue-lock',
    volume_number = 27,
    total_volumes = 31
WHERE id = '88888888-8888-8888-8888-888888888006'::uuid;

UPDATE release_schedules SET 
    slug = 'chainsaw-man-boxset-phan-1',
    series_name = 'Chainsaw Man',
    series_slug = 'chainsaw-man',
    volume_number = 1,
    total_volumes = 11
WHERE id = '88888888-8888-8888-8888-888888888007'::uuid;

-- Fallback for any other rows
UPDATE release_schedules 
SET slug = 'tap-' || substring(id::text from 1 for 8),
    series_name = title,
    series_slug = 'truyen-tranh'
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_release_schedules_slug ON release_schedules(slug);
CREATE INDEX IF NOT EXISTS idx_release_schedules_series_slug ON release_schedules(series_slug);

-- 2. Store links for multi-store purchasing (Shopee, TikTok Shop, Boki, Fahasa)
CREATE TABLE IF NOT EXISTS release_store_links (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id       UUID NOT NULL REFERENCES release_schedules(id) ON DELETE CASCADE,
    edition_id       UUID REFERENCES release_schedule_editions(id) ON DELETE CASCADE,
    platform          VARCHAR(50) NOT NULL, -- BOKI_STORE, SHOPEE, TIKTOK_SHOP, FAHASA, OTHER
    store_name        VARCHAR(100),
    product_url       VARCHAR(1000) NOT NULL,
    market_price      DECIMAL(12, 2),
    is_preorder       BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_release_store_links_schedule ON release_store_links(schedule_id);

-- Seed initial store links
INSERT INTO release_store_links (schedule_id, platform, store_name, product_url, market_price, sort_order)
SELECT '88888888-8888-8888-8888-888888888001'::uuid, 'SHOPEE', 'Kim Đồng Official Shopee', 'https://shopee.vn/kimdong', 75000.00, 1
WHERE EXISTS (SELECT 1 FROM release_schedules WHERE id = '88888888-8888-8888-8888-888888888001'::uuid);

INSERT INTO release_store_links (schedule_id, platform, store_name, product_url, market_price, sort_order)
SELECT '88888888-8888-8888-8888-888888888001'::uuid, 'TIKTOK_SHOP', 'Nhà Xuất Bản Kim Đồng', 'https://www.tiktok.com/@nxbkimdong', 75000.00, 2
WHERE EXISTS (SELECT 1 FROM release_schedules WHERE id = '88888888-8888-8888-8888-888888888001'::uuid);

-- 3. Release changelog (Lịch sử thay đổi ngày, dời lịch, tăng giá)
CREATE TABLE IF NOT EXISTS release_changelogs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id       UUID NOT NULL REFERENCES release_schedules(id) ON DELETE CASCADE,
    edition_id       UUID REFERENCES release_schedule_editions(id) ON DELETE SET NULL,
    change_type       VARCHAR(50) NOT NULL DEFAULT 'DATE_DELAY',
    old_value         VARCHAR(255),
    new_value         VARCHAR(255),
    title             VARCHAR(255) NOT NULL,
    reason            TEXT,
    source_url        VARCHAR(500),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_release_changelogs_schedule ON release_changelogs(schedule_id);

-- Seed initial changelog announcement
INSERT INTO release_changelogs (schedule_id, change_type, old_value, new_value, title, reason)
SELECT '88888888-8888-8888-8888-888888888001'::uuid, 'EDITION_UPDATE', 'Chuẩn bị phát hành', 'Bổ sung quà tặng', 
       'Bổ sung Standee Acrylic Gojo & Sukuna', 'NXB Kim Đồng công bố phụ kiện độc quyền cho bản đặc biệt'
WHERE EXISTS (SELECT 1 FROM release_schedules WHERE id = '88888888-8888-8888-8888-888888888001'::uuid);

-- 4. User Manga Collections (Tủ sách cá nhân & Missing Volumes)
CREATE TABLE IF NOT EXISTS user_manga_collections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id       UUID NOT NULL REFERENCES release_schedules(id) ON DELETE CASCADE,
    edition_id       UUID REFERENCES release_schedule_editions(id) ON DELETE SET NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'OWNED', -- OWNED, SEEKING, WISHLIST, DROPPED
    purchase_price    DECIMAL(12, 2),
    purchase_place    VARCHAR(100),
    purchased_at      DATE,
    reading_status    VARCHAR(30) NOT NULL DEFAULT 'UNREAD', -- UNREAD, READING, COMPLETED
    personal_rating   SMALLINT,
    notes             TEXT,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_manga_coll ON user_manga_collections(user_id, schedule_id, COALESCE(edition_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX IF NOT EXISTS idx_user_manga_collections_user ON user_manga_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_manga_collections_status ON user_manga_collections(status);
