-- Migration V027: Create Chatbot Tables (Knowledge Base, Audit Log, Confirmation Tickets)

-- 1. Knowledge Base Table
CREATE TABLE IF NOT EXISTS chat_knowledge_base (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_kb_category ON chat_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_chat_kb_active ON chat_knowledge_base(is_active);

-- Seed Initial Knowledge Base for BokiStore
INSERT INTO chat_knowledge_base (category, title, content, keywords) VALUES
('SHIPPING', 'Chính sách vận chuyển & Phí giao hàng', 
 'BokiStore giao hàng toàn quốc:\n- Miễn phí vận chuyển (FREESHIP) cho mọi đơn hàng từ 250.000đ trở lên.\n- Giao hàng tiêu chuẩn: 20.000đ - 30.000đ tùy khu vực (thời gian 2-4 ngày làm việc).\n- Giao hàng hỏa tốc (nội thành Hà Nội & TP.HCM): 40.000đ (nhận hàng trong 2-4 giờ).\n- Đối tác vận chuyển: Giao Hàng Nhanh (GHN), Viettel Post, Shopee Xpress.', 
 ARRAY['shipping', 'ship', 'phí ship', 'giao hàng', 'freeship', 'hỏa tốc', 'thời gian giao']),

('RETURN', 'Chính sách đổi trả & Hoàn tiền', 
 'Quy định đổi trả tại BokiStore trong vòng 7 ngày kể từ khi nhận hàng:\n- Đổi mới 100% miễn phí nếu sách bị lỗi in ấn, thiếu trang, rách trang, móp gáy nặng do vận chuyển.\n- Với sách nguyên màng co: Được đổi sang tựa sách khác nếu còn nguyên seal.\n- Quy trình: Khách hàng chỉ cần chụp ảnh/video mở gói hàng và gửi yêu cầu qua khung chat hoặc hotline 1900-BOKI, shipper sẽ đến tận nơi đổi sách mới.', 
 ARRAY['return', 'đổi trả', 'hoàn tiền', 'lỗi sách', 'rách', 'hỏng', 'bảo hành']),

('VIP', 'Chính sách thành viên & Quyền lợi VIP', 
 'Hệ thống hạng thành viên BokiStore Club:\n- Hạng Standard (Mặc định): Tích lũy 1% điểm cho mọi đơn hàng.\n- Hạng Silver (Chi tiêu từ 1.000.000đ): Giảm trực tiếp 3% mọi đơn hàng + Quà sinh nhật 50k voucher.\n- Hạng Gold (Chi tiêu từ 5.000.000đ): Giảm 5% mọi đơn hàng + Ưu tiên đặt trước bản đặc biệt Limited.\n- Hạng Platinum (Chi tiêu từ 10.000.000đ): Giảm 8% + Miễn phí ship mọi đơn hàng không giới hạn.\n- Hạng Diamond (Chi tiêu từ 20.000.000đ): Giảm 10% + Nhận trọn bộ bookmark/postcard độc quyền tác giả.', 
 ARRAY['vip', 'hạng thành viên', 'member tier', 'điểm thưởng', 'chiết khấu', 'ưu đãi']),

('PAYMENT', 'Phương thức thanh toán hỗ trợ', 
 'BokiStore hỗ trợ đa dạng phương thức thanh toán an toàn:\n1. Thanh toán khi nhận hàng (COD toàn quốc).\n2. Cổng thanh toán VNPAY (Quét mã VNPAY-QR từ ứng dụng ngân hàng).\n3. Chuyển khoản ngân hàng tự động qua mã VietQR.\n4. Thẻ ATM nội địa và thẻ quốc tế Visa / MasterCard / JCB.', 
 ARRAY['payment', 'thanh toán', 'cod', 'vnpay', 'chuyển khoản', 'vietqr', 'thẻ']),

('PREORDER', 'Quy định đặt trước sách & Boxset Limited', 
 'Chính sách sách Đặt trước (Pre-order) tại BokiStore:\n- Giúp độc giả chắc chắn sở hữu các ấn bản Giới hạn (Limited Edition), Boxset, kèm quà tặng độc quyền của tác giả.\n- Thời gian giao hàng dự kiến được ghi rõ trên từng sản phẩm (thường từ 7 đến 14 ngày làm việc kể từ ngày phát hành chính thức).\n- Được quyền hủy đặt trước và hoàn tiền 100% trước ngày sách chính thức nhập kho.', 
 ARRAY['preorder', 'đặt trước', 'limited', 'bản đặc biệt', 'boxset', 'quà tặng']),

('STORE_INFO', 'Thông tin liên hệ & Giờ hoạt động BokiStore', 
 'BokiStore - Nhà sách Manga, Light Novel & Sách Bản Quyền Trực Tuyến:\n- Hotline hỗ trợ: 1900-888-BOKI (8h00 - 21h30 hàng ngày)\n- Email: support@bokistore.vn\n- Kho vận chính: Quận Cầu Giấy, Hà Nội & Quận 1, TP. Hồ Chí Minh.\n- Cam kết: 100% sách mới có bản quyền từ các nhà xuất bản uy tín (Kim Đồng, Trẻ, IPM, Wings Books, Amak, Nhã Nam...).', 
 ARRAY['liên hệ', 'hotline', 'cửa hàng', 'địa chỉ', 'email', 'chính hãng', 'bản quyền']);

-- 2. Audit Log Table (Observability & Feedback)
CREATE TABLE IF NOT EXISTS chat_audit_log (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    user_id UUID,
    client_ip VARCHAR(50),
    user_message TEXT,
    intent_detected VARCHAR(100),
    tools_called TEXT[] DEFAULT '{}',
    bot_response TEXT,
    latency_ms INT DEFAULT 0,
    token_count INT DEFAULT 0,
    is_fallback BOOLEAN DEFAULT FALSE,
    feedback VARCHAR(20), -- 'LIKE', 'DISLIKE'
    feedback_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_audit_session ON chat_audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_created_at ON chat_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_audit_intent ON chat_audit_log(intent_detected);

-- 3. Confirmation Tickets Table (High Risk Admin Actions)
CREATE TABLE IF NOT EXISTS chat_confirmation_tickets (
    id VARCHAR(100) PRIMARY KEY,
    admin_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, EXPIRED
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_confirm_status ON chat_confirmation_tickets(status);
CREATE INDEX IF NOT EXISTS idx_chat_confirm_expires ON chat_confirmation_tickets(expires_at);
