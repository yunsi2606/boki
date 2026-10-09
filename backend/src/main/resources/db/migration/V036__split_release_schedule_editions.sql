-- ============================================
-- V036: Split Release Schedules into Master-Detail (1 Schedule -> N Editions)
-- ============================================

-- Add pre_order_date to master table
ALTER TABLE release_schedules ADD COLUMN IF NOT EXISTS pre_order_date DATE;

-- Create editions detail table
CREATE TABLE IF NOT EXISTS release_schedule_editions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id       UUID NOT NULL REFERENCES release_schedules(id) ON DELETE CASCADE,
    edition_name      VARCHAR(100) NOT NULL,
    edition_type      VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    release_date      DATE, -- Nullable: if null, inherits from release_schedules.release_date
    pre_order_date    DATE, -- Nullable: if null, inherits from release_schedules.pre_order_date
    estimated_price   DECIMAL(12, 2),
    gifts             TEXT,
    cover_url         VARCHAR(500),
    status            VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    book_id           UUID REFERENCES books(id) ON DELETE SET NULL,
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_release_schedule_editions_schedule_id ON release_schedule_editions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_release_schedule_editions_release_date ON release_schedule_editions(release_date);
CREATE INDEX IF NOT EXISTS idx_release_schedule_editions_book_id ON release_schedule_editions(book_id);

-- Migrate existing V035 data into release_schedule_editions
INSERT INTO release_schedule_editions (
    id, schedule_id, edition_name, edition_type, release_date, pre_order_date,
    estimated_price, gifts, cover_url, status, book_id, sort_order
)
SELECT
    gen_random_uuid(),
    s.id,
    CASE 
        WHEN s.edition_type = 'SPECIAL' THEN 'Bản Đặc Biệt'
        WHEN s.edition_type = 'LIMITED' THEN 'Bản Giới Hạn'
        WHEN s.edition_type = 'BOXSET' THEN 'Boxset'
        ELSE 'Bản Phổ Thông'
    END,
    COALESCE(s.edition_type, 'STANDARD'),
    NULL, -- inherits from schedule
    NULL,
    s.estimated_price,
    s.gifts,
    s.cover_url,
    COALESCE(s.status, 'SCHEDULED'),
    s.book_id,
    0
FROM release_schedules s
WHERE NOT EXISTS (
    SELECT 1 FROM release_schedule_editions e WHERE e.schedule_id = s.id
);

-- Add second edition (Bản Phổ Thông) for Jujutsu Kaisen 25 to demonstrate multi-editions
INSERT INTO release_schedule_editions (
    id, schedule_id, edition_name, edition_type, release_date, pre_order_date,
    estimated_price, gifts, cover_url, status, book_id, sort_order
)
SELECT
    '88888888-8888-8888-8888-888888888011'::uuid,
    '88888888-8888-8888-8888-888888888001'::uuid,
    'Bản Phổ Thông',
    'STANDARD',
    NULL,
    NULL,
    35000.00,
    'Tặng kèm 01 Bookmark Gojo Satoru',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    'SCHEDULED',
    NULL,
    1
WHERE EXISTS (SELECT 1 FROM release_schedules WHERE id = '88888888-8888-8888-8888-888888888001'::uuid)
ON CONFLICT (id) DO NOTHING;
