-- =============================================
-- V029: Add post_type to blogs and create blog_linked_books table
-- =============================================

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS post_type VARCHAR(20) NOT NULL DEFAULT 'REGULAR';
CREATE INDEX IF NOT EXISTS idx_blogs_post_type ON blogs(post_type);

CREATE TABLE IF NOT EXISTS blog_linked_books (
    blog_id     UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (blog_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_linked_books_blog_id ON blog_linked_books(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_linked_books_book_id ON blog_linked_books(book_id);

-- Seed sample preview post for demonstration
INSERT INTO blogs (
    id, author_id, author_name, title, slug, excerpt, content, cover_image, category, tags, status, post_type, views_count, reading_time_minutes, is_featured, published_at
)
SELECT
    '99999999-9999-9999-9999-999999999001'::uuid,
    u.id,
    u.display_name,
    'Đọc thử Gokurakugai - Chương 1: Thành Phố Cực Lạc',
    'doc-thu-gokurakugai-chuong-1',
    'Khám phá chương đầu tiên của siêu phẩm hành động trừ tà đình đám Gokurakugai. Trải nghiệm trước nét vẽ đỉnh cao và cốt truyện lôi cuốn trước khi quyết định mua sách!',
    '<h2>Gokurakugai - Chương 1: Lời Mời Đến Khu Phố Cực Lạc</h2>
<p>Khu phố Gokurakugai, nơi ánh đèn neon rực rỡ che giấu những góc khuất tăm tối nhất của xã hội. Tao và Alma - hai chuyên gia giải quyết mọi rắc rối - vừa nhận được một nhiệm vụ kỳ bí...</p>
<blockquote>"Ở khu phố này, chỉ có hai loại người: kẻ săn mồi và con mồi. Đừng bao giờ lùi bước trước bóng tối."</blockquote>
<h3>Trích Đoạn Mở Đầu</h3>
<p>Alma rút thanh kiếm sáng loáng, ánh mắt sắc lẹm đối diện với bóng đen đang dần hiện hình dưới gầm cầu tàu. Gió biển thổi lồng lộng cuốn theo mùi muối và sát khí...</p>
<p><em>— Bạn vừa đọc xong trích đoạn mở đầu chương 1 của Gokurakugai. Xem chi tiết và đặt mua ngay tập 1 & tập 2 bên dưới để đón đọc toàn bộ tác phẩm với đầy đủ quà tặng kèm bản giới hạn!</em></p>',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    'Manga & Comic',
    ARRAY['Manga', 'Hành Động', 'Đọc thử'],
    'PUBLISHED',
    'PREVIEW',
    256,
    7,
    TRUE,
    CURRENT_TIMESTAMP
FROM users u
WHERE u.role = 'ADMIN'
ORDER BY u.created_at ASC
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- Link sample preview post with existing books if any
INSERT INTO blog_linked_books (blog_id, book_id, sort_order)
SELECT
    '99999999-9999-9999-9999-999999999001'::uuid,
    b.id,
    ROW_NUMBER() OVER (ORDER BY b.created_at DESC)
FROM books b
LIMIT 2
ON CONFLICT DO NOTHING;
