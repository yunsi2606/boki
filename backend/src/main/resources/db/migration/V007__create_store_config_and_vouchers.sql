-- V007: Create store_config and vouchers tables for BokiStore

CREATE TABLE IF NOT EXISTS store_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- 'SHIPPING' or 'PRODUCT'
    tag VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    usage_limit INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial default configuration
INSERT INTO store_config (config_key, config_value)
VALUES ('homepage_hero_tag', '⚡ SIÊU ƯU ĐÃI THÁNG 9'),
       ('homepage_hero_title', 'ĐỒNG GIÁ'),
       ('homepage_hero_highlight', '49.000đ'),
       ('homepage_hero_subtitle', 'Sở hữu trọn đời Ebook, Manga & Light Novel bản quyền độc quyền trên BokiStore.'),
       ('homepage_banner_image', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200&h=600')
ON CONFLICT (config_key) DO NOTHING;

-- Seed initial vouchers
INSERT INTO vouchers (id, code, type, tag, title, description, discount_amount, min_order_amount, usage_limit, used_count, is_active)
VALUES ('v1', 'FREESHIP20', 'SHIPPING', 'MÃ VẬN CHUYỂN', 'Giảm 20K phí vận chuyển, đơn tối thiểu 150K', 'Đang có hiệu lực', 20000, 150000, 500, 193, TRUE),
       ('v2', 'BOKI20K', 'PRODUCT', 'GIẢM GIÁ SẢN PHẨM', 'Giảm 20K cho Manga/Comic đơn 200K', 'Đang có hiệu lực', 20000, 200000, 300, 300, TRUE),
       ('v3', 'BOKI10K', 'PRODUCT', 'GIẢM GIÁ SẢN PHẨM', 'Giảm 10K cho đơn bất kỳ từ 99K', 'Đang có hiệu lực', 10000, 99000, 500, 186, TRUE)
ON CONFLICT (id) DO NOTHING;
