-- =============================================
-- V026: Blog Categories System
-- =============================================

CREATE TABLE IF NOT EXISTS blog_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- Seed default blog categories
INSERT INTO blog_categories (name, slug, description) VALUES
('Tin tức', 'tin-tuc', 'Cập nhật tin tức xuất bản, bản quyền và sự kiện manga / anime'),
('Đánh giá sách', 'danh-gia-sach', 'Review, cảm nhận và phân tích tác phẩm chuyên sâu'),
('Góc đọc', 'goc-doc', 'Không gian chia sẻ đam mê đọc và bộ sưu tập sách'),
('Kinh nghiệm', 'kinh-nghiem', 'Mẹo bảo quản sách, chọn sách và phương pháp đọc hiệu quả'),
('Giới thiệu tác giả', 'gioi-thieu-tac-gia', 'Tiểu sử và hành trình sáng tác của các tác giả nổi tiếng'),
('Sự kiện & Khuyến mãi', 'su-kien-khuyen-mai', 'Chương trình ưu đãi, hội sách và mini-game'),
('Review', 'review', 'Đánh giá các bộ truyện, sách mới phát hành'),
('Hướng dẫn', 'huong-dan', 'Hướng dẫn kỹ năng đọc, bảo quản và sưu tầm sách'),
('Chung', 'chung', 'Các bài viết tổng hợp khác')
ON CONFLICT (name) DO NOTHING;

-- Also dynamically sync any other existing distinct categories from blogs
INSERT INTO blog_categories (name, slug)
SELECT DISTINCT
    b.category,
    LOWER(REGEXP_REPLACE(b.category, '\s+', '-', 'g'))
FROM blogs b
WHERE b.category IS NOT NULL
  AND TRIM(b.category) <> ''
ON CONFLICT (name) DO NOTHING;
