-- V044: Add detailed publishing metadata and dynamic specs to release_schedules
ALTER TABLE release_schedules
    ADD COLUMN IF NOT EXISTS artist VARCHAR(255),
    ADD COLUMN IF NOT EXISTS genres VARCHAR(500),
    ADD COLUMN IF NOT EXISTS format VARCHAR(50) DEFAULT 'MANGA',
    ADD COLUMN IF NOT EXISTS series_status VARCHAR(50) DEFAULT 'ONGOING',
    ADD COLUMN IF NOT EXISTS age_rating VARCHAR(50) DEFAULT '13+',
    ADD COLUMN IF NOT EXISTS imprint VARCHAR(100),
    ADD COLUMN IF NOT EXISTS specs TEXT;

-- Update realistic defaults for existing records
UPDATE release_schedules
SET genres = COALESCE(genres, 'Hành động, Shonen, Phiêu lưu'),
    format = COALESCE(format, 'MANGA'),
    series_status = COALESCE(series_status, 'ONGOING'),
    age_rating = COALESCE(age_rating, '13+'),
    specs = COALESCE(specs, '{"Khổ sách": "11.3 x 17.6 cm", "Số trang": "192", "Loại bìa": "Bìa mềm có Jacket"}')
WHERE genres IS NULL;

UPDATE release_schedules
SET format = 'LIGHT_NOVEL',
    genres = 'Isekai, Giả tưởng, Phép thuật',
    specs = '{"Khổ sách": "13 x 19 cm", "Số trang": "416", "Loại bìa": "Bìa gập kèm Poster"}'
WHERE series_slug LIKE '%overlord%' OR title ILIKE '%overlord%';

UPDATE release_schedules
SET artist = 'Yusuke Nomura',
    genres = 'Thể thao, Bóng đá, Shonen, Kịch tính',
    specs = '{"Khổ sách": "11.3 x 17.6 cm", "Số trang": "208", "Loại bìa": "Bìa rời có Jacket"}'
WHERE series_slug LIKE '%bluelock%' OR title ILIKE '%bluelock%';

UPDATE release_schedules
SET genres = 'Shonen, Siêu nhiên, Hành động, Kỳ ảo đen tối',
    age_rating = '16+',
    specs = '{"Khổ sách": "11.3 x 17.6 cm", "Số trang": "192", "Loại bìa": "Bìa áo cán mờ"}'
WHERE series_slug LIKE '%chu-thuat-hoi-chien%' OR title ILIKE '%chu-thuat%';

UPDATE release_schedules
SET genres = 'Hành động, Hài hước, Shonen, Sát thủ',
    specs = '{"Khổ sách": "11.3 x 17.6 cm", "Số trang": "192", "Loại bìa": "Bìa rời có Jacket"}'
WHERE series_slug LIKE '%sakamoto%';

UPDATE release_schedules
SET format = 'ARTBOOK',
    genres = 'Artbook, Minh họa, Tranh màu',
    specs = '{"Khổ sách": "A4 (21 x 29.7 cm)", "Số trang": "128", "Loại bìa": "Bìa cứng in màu toàn bộ"}'
WHERE series_slug LIKE '%clamp%';
