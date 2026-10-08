-- ============================================
-- V035: Create Release Schedules Table and Seed Data
-- ============================================

CREATE TABLE IF NOT EXISTS release_schedules (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(255) NOT NULL,
    original_title    VARCHAR(255),
    publisher         VARCHAR(100) NOT NULL,
    author            VARCHAR(255),
    release_date      DATE NOT NULL,
    estimated_price   DECIMAL(12, 2),
    edition_type      VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    gifts             TEXT,
    cover_url         VARCHAR(500),
    description       TEXT,
    status            VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    book_id           UUID REFERENCES books(id) ON DELETE SET NULL,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_release_schedules_date ON release_schedules(release_date);
CREATE INDEX IF NOT EXISTS idx_release_schedules_publisher ON release_schedules(publisher);
CREATE INDEX IF NOT EXISTS idx_release_schedules_status ON release_schedules(status);
CREATE INDEX IF NOT EXISTS idx_release_schedules_book_id ON release_schedules(book_id);

-- Seed initial publisher release schedules (October & November 2026)
INSERT INTO release_schedules (
    id, title, original_title, publisher, author, release_date, estimated_price,
    edition_type, gifts, cover_url, description, status, book_id
)
SELECT
    '88888888-8888-8888-8888-888888888001'::uuid,
    'Chú Thuật Hồi Chiến - Tập 25 (Bản Đặc Biệt)',
    'Jujutsu Kaisen 25',
    'Kim Đồng',
    'Gege Akutami',
    DATE '2026-10-16',
    75000.00,
    'SPECIAL',
    'Tặng kèm 01 Standee Acrylic Gojo & Sukuna + 01 Bìa áo Metalize + Bookmark 2 mặt',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    'Trận quyết chiến Shinjuku bước vào giai đoạn khốc liệt nhất giữa Lôi Thần và Vua Lời Nguyền. Phiên bản đặc biệt độc quyền có bìa áo metalize hiệu ứng hologram lấp lánh.',
    'SCHEDULED',
    (SELECT id FROM books LIMIT 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO release_schedules (
    id, title, original_title, publisher, author, release_date, estimated_price,
    edition_type, gifts, cover_url, description, status, book_id
)
VALUES
(
    '88888888-8888-8888-8888-888888888002'::uuid,
    'One Piece - Tập 108',
    'One Piece 108',
    'Kim Đồng',
    'Eiichiro Oda',
    DATE '2026-10-23',
    35000.00,
    'STANDARD',
    'Tặng kèm 01 Obi kỷ niệm + 01 Postcard Luffy Gear 5',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
    'Băng Mũ Rơm tiếp tục hành trình kịch tính tại đảo tương lai Egghead khi Ngũ Lão Tinh chính thức ra tay.',
    'SCHEDULED',
    NULL
),
(
    '88888888-8888-8888-8888-888888888003'::uuid,
    'Spy x Family - Tập 13 (Bản Giới Hạn)',
    'SPY×FAMILY 13',
    'Kim Đồng',
    'Tatsuya Endo',
    DATE '2026-10-30',
    95000.00,
    'LIMITED',
    'Kèm 01 Huy hiệu Anya dập nổi + Sách minh họa mini màu',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    'Nhiệm vụ mới của gia đình Forger đầy ắp những tình huống dở khóc dở cười nhưng không kém phần hồi hộp.',
    'SCHEDULED',
    NULL
),
(
    '88888888-8888-8888-8888-888888888004'::uuid,
    'Gokurakugai - Tập 2 (Bản Giới Hạn)',
    'Gokurakugai 2',
    'IPM',
    'Yuto Sano',
    DATE '2026-10-18',
    89000.00,
    'LIMITED',
    'Bộ 03 Card PVC trong suốt bọc màng bạc + Obi dập chìm',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    'Thành phố Cực Lạc chìm trong bí ẩn khi thế lực Ma Họa ngấm ngầm trỗi dậy. Tao và Alma phải đối đầu với cựu đồng minh.',
    'SCHEDULED',
    NULL
),
(
    '88888888-8888-8888-8888-888888888005'::uuid,
    'Frieren - Pháp Sư Tiễn Táng - Tập 12',
    'Sousou no Frieren 12',
    'NXB Trẻ',
    'Kanehito Yamada & Tsukasa Abe',
    DATE '2026-10-25',
    60000.00,
    'STANDARD',
    '01 Bookmark dạ quang + Bìa áo đặc biệt',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    'Chuyến hành trình về phương Bắc của Frieren, Fern và Stark chạm đến những vùng đất lịch sử cổ xưa thời Anh hùng Himmel.',
    'SCHEDULED',
    NULL
),
(
    '88888888-8888-8888-8888-888888888006'::uuid,
    'Blue Lock - Tập 27 (Bản Thường)',
    'Blue Lock 27',
    'IPM',
    'Muneyuki Kaneshiro & Yusuke Nomura',
    DATE '2026-11-05',
    45000.00,
    'STANDARD',
    '01 Photocard Isagi Yoichi',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800',
    'Trận đấu Neo Egoist League đỉnh cao quyết định tấm vé vào đội tuyển U-20 thế giới.',
    'SCHEDULED',
    NULL
),
(
    '88888888-8888-8888-8888-888888888007'::uuid,
    'Chainsaw Man - Boxset Phần 1 (Tập 1 - 11)',
    'Chainsaw Man Box Set',
    'NXB Trẻ',
    'Tatsuki Fujimoto',
    DATE '2026-11-12',
    480000.00,
    'BOXSET',
    'Hộp cứng nam châm dập kim loại + 11 Bìa áo độc quyền + Poster khổ lớn',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800',
    'Toàn bộ phần 1 câu chuyện về Denji và Quỷ Cưa gom trong một chiếc Boxset sang trọng, giới hạn 1000 bản.',
    'SCHEDULED',
    NULL
)
ON CONFLICT (id) DO NOTHING;
