-- =============================================
-- V025: Blog System Tables
-- =============================================

CREATE TABLE blogs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name     VARCHAR(100) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    excerpt         VARCHAR(500),
    content         TEXT NOT NULL,
    cover_image     VARCHAR(500),
    category        VARCHAR(100) NOT NULL DEFAULT 'Chung',
    tags            TEXT[] DEFAULT '{}',
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    views_count     INTEGER NOT NULL DEFAULT 0,
    likes_count     INTEGER NOT NULL DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 5,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Media reference tracking for R2 garbage collection
CREATE TABLE blog_media_refs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id         UUID REFERENCES blogs(id) ON DELETE CASCADE,
    media_url       VARCHAR(500) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_published_at ON blogs(published_at DESC NULLS LAST);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_author ON blogs(author_id);
CREATE INDEX idx_blogs_featured ON blogs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_blog_media_refs_blog_id ON blog_media_refs(blog_id);

-- Seed data: 3 sample published blog posts
INSERT INTO blogs (id, author_id, author_name, title, slug, excerpt, content, category, tags, status, views_count, reading_time_minutes, is_featured, published_at)
SELECT
    gen_random_uuid(),
    u.id,
    u.display_name,
    'Top 10 Manga Đáng Đọc Nhất Mùa Thu 2026',
    'top-10-manga-dang-doc-nhat-mua-thu-2026',
    'Khám phá những bộ manga hot nhất mùa thu này - từ hành động, lãng mạn đến kinh dị, tất cả đều có tại BokiStore!',
    '<h2>Mùa Thu Này Đọc Gì?</h2>
<p>Mùa thu luôn là thời điểm hoàn hảo để cuộn mình trong chăn và đọc manga. Dưới đây là danh sách <strong>10 bộ manga đáng đọc nhất</strong> mà đội ngũ BokiStore chọn lọc cho bạn.</p>
<h3>1. Jujutsu Kaisen - Chú Thuật Hồi Chiến</h3>
<p>Bộ manga hành động đình đám vẫn tiếp tục gây sốt với arc mới đầy kịch tính. Akutami Gege không ngừng mang đến những plot twist khiến người đọc nghẹt thở.</p>
<h3>2. Spy × Family</h3>
<p>Sự kết hợp hoàn hảo giữa <em>hài hước</em>, <em>hành động</em> và <em>gia đình</em>. Anya vẫn là nhân vật đáng yêu nhất manga hiện tại!</p>
<blockquote>Manga không chỉ là giải trí - đó là nghệ thuật kể chuyện bằng hình ảnh ở đỉnh cao nhất.</blockquote>
<h3>3. Chainsaw Man - Part 2</h3>
<p>Tatsuki Fujimoto tiếp tục chứng minh thiên tài sáng tạo với phần 2 đầy bất ngờ và điên rồ.</p>
<p>Và còn nhiều hơn nữa... Ghé thăm <a href="/books">cửa hàng BokiStore</a> để khám phá toàn bộ danh sách!</p>',
    'Review',
    ARRAY['Manga', 'Review', 'Top 10', 'Mùa Thu'],
    'PUBLISHED',
    256,
    8,
    TRUE,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM users u
WHERE u.role = 'ADMIN'
LIMIT 1;

INSERT INTO blogs (id, author_id, author_name, title, slug, excerpt, content, category, tags, status, views_count, reading_time_minutes, is_featured, published_at)
SELECT
    gen_random_uuid(),
    u.id,
    u.display_name,
    'Bí Quyết Xây Dựng Thói Quen Đọc Sách Mỗi Ngày',
    'bi-quyet-xay-dung-thoi-quen-doc-sach-moi-ngay',
    'Làm sao để đọc sách trở thành thói quen hàng ngày? 5 phương pháp đã được chứng minh hiệu quả từ những người đọc nhiều nhất.',
    '<h2>Tại Sao Đọc Sách Quan Trọng?</h2>
<p>Đọc sách không chỉ giúp bạn <strong>mở rộng kiến thức</strong> mà còn cải thiện trí nhớ, giảm stress và tăng cường khả năng tập trung.</p>
<h3>1. Bắt Đầu Với 15 Phút Mỗi Ngày</h3>
<p>Đừng đặt mục tiêu quá lớn. Hãy bắt đầu với 15 phút đọc sách mỗi sáng hoặc trước khi ngủ. Dần dần, bạn sẽ muốn đọc nhiều hơn.</p>
<h3>2. Luôn Mang Theo Sách</h3>
<p>Dù là sách giấy hay e-book, hãy luôn có một cuốn sách bên mình. Những khoảng thời gian chờ đợi sẽ trở nên có ý nghĩa hơn.</p>
<h3>3. Tạo Không Gian Đọc Sách</h3>
<p>Một góc nhỏ yên tĩnh với ánh sáng đủ sáng sẽ giúp bạn tập trung hơn khi đọc.</p>
<h3>4. Đọc Những Gì Bạn Thích</h3>
<p>Không có quy tắc nào bắt buộc bạn phải đọc thể loại nào. <em>Manga, light novel, tiểu thuyết, sách self-help</em> - miễn là bạn đọc!</p>
<h3>5. Chia Sẻ Với Cộng Đồng</h3>
<p>Tham gia các nhóm đọc sách để có thêm động lực và góc nhìn mới từ những người cùng sở thích.</p>',
    'Hướng dẫn',
    ARRAY['Đọc sách', 'Thói quen', 'Self-help', 'Hướng dẫn'],
    'PUBLISHED',
    183,
    6,
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '5 days'
FROM users u
WHERE u.role = 'ADMIN'
LIMIT 1;

INSERT INTO blogs (id, author_id, author_name, title, slug, excerpt, content, category, tags, status, views_count, reading_time_minutes, is_featured, published_at)
SELECT
    gen_random_uuid(),
    u.id,
    u.display_name,
    'Light Novel: Cánh Cổng Dẫn Tới Thế Giới Anime',
    'light-novel-canh-cong-dan-toi-the-gioi-anime',
    'Tìm hiểu về light novel - thể loại sách đang bùng nổ tại Việt Nam và mối quan hệ mật thiết với anime.',
    '<h2>Light Novel Là Gì?</h2>
<p>Light novel (ライトノベル) là thể loại tiểu thuyết nhẹ phổ biến tại Nhật Bản, thường có kèm <strong>minh họa manga</strong> và được viết với văn phong dễ đọc, hấp dẫn.</p>
<h3>Tại Sao Light Novel Đang Hot?</h3>
<p>Rất nhiều bộ anime đình đám hiện nay đều được chuyển thể từ light novel:</p>
<ul>
<li><strong>Sword Art Online</strong> - Reki Kawahara</li>
<li><strong>Re:Zero</strong> - Tappei Nagatsuki</li>
<li><strong>Mushoku Tensei</strong> - Rifujin na Magonote</li>
<li><strong>86 -Eighty Six-</strong> - Asato Asato</li>
</ul>
<h3>Đọc Light Novel Ở Đâu?</h3>
<p>Tại Việt Nam, light novel đã được các nhà xuất bản như <em>IPM, NXB Trẻ, Kim Đồng</em> bản quyền và phát hành chính thức.</p>
<p>BokiStore luôn cập nhật những đầu sách light novel mới nhất. Ghé thăm <a href="/books">cửa hàng</a> ngay!</p>',
    'Tin tức',
    ARRAY['Light Novel', 'Anime', 'Tin tức', 'Nhật Bản'],
    'PUBLISHED',
    142,
    5,
    FALSE,
    CURRENT_TIMESTAMP - INTERVAL '7 days'
FROM users u
WHERE u.role = 'ADMIN'
LIMIT 1;
