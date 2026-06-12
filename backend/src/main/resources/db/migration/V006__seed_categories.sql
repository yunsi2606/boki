-- ============================================
-- V006: Seed initial book categories
-- ============================================

INSERT INTO categories (name, slug, description, parent_id) VALUES
-- Root categories
('Văn học',         'van-hoc',         'Tiểu thuyết, truyện ngắn, thơ ca và các tác phẩm văn học',     NULL),
('Kinh tế',         'kinh-te',         'Kinh doanh, tài chính, quản trị và khởi nghiệp',                NULL),
('Khoa học',        'khoa-hoc',        'Khoa học tự nhiên, vật lý, hóa học, sinh học',                  NULL),
('Công nghệ',       'cong-nghe',       'Lập trình, CNTT, AI và công nghệ kỹ thuật số',                  NULL),
('Lịch sử',         'lich-su',         'Lịch sử Việt Nam và thế giới, nhân vật lịch sử',                NULL),
('Thiếu nhi',       'thieu-nhi',       'Sách dành cho trẻ em và thiếu niên',                            NULL),
('Tâm lý học',      'tam-ly-hoc',      'Tâm lý, kỹ năng sống và phát triển bản thân',                  NULL),
('Giáo dục',        'giao-duc',        'Sách giáo khoa, tham khảo và học ngoại ngữ',                    NULL),
('Nghệ thuật',      'nghe-thuat',      'Âm nhạc, hội họa, điện ảnh và các loại hình nghệ thuật',        NULL),
('Sức khỏe',        'suc-khoe',        'Y học, dinh dưỡng, thể thao và lối sống lành mạnh',             NULL);
