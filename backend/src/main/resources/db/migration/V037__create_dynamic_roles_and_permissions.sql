-- V037__create_dynamic_roles_and_permissions.sql
-- Create tables for dynamic RBAC: roles, permissions, role_permissions, user_roles

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    color VARCHAR(20) DEFAULT '#4F46E5',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Seed permissions
INSERT INTO permissions (id, code, name, module, description) VALUES
    ('00000000-0000-0000-0001-000000000001', 'BOOK_VIEW', 'Xem danh mục & sách', 'BOOKS', 'Quyền xem danh sách sách, biến thể và chi tiết ấn phẩm'),
    ('00000000-0000-0000-0001-000000000002', 'BOOK_MANAGE', 'Quản lý sách & kho', 'BOOKS', 'Thêm mới, sửa, xóa sách, phân loại, combo và tồn kho'),
    ('00000000-0000-0000-0001-000000000003', 'ORDER_VIEW', 'Xem đơn hàng', 'ORDERS', 'Quyền xem danh sách đơn hàng và thông tin khách mua'),
    ('00000000-0000-0000-0001-000000000004', 'ORDER_MANAGE', 'Xử lý đơn hàng', 'ORDERS', 'Duyệt đơn, đổi trạng thái vận chuyển, hủy và hoàn tiền'),
    ('00000000-0000-0000-0001-000000000005', 'SCHEDULE_VIEW', 'Xem lịch phát hành', 'SCHEDULE', 'Xem lịch phát hành từ các nhà xuất bản'),
    ('00000000-0000-0000-0001-000000000006', 'SCHEDULE_MANAGE', 'Quản lý lịch phát hành', 'SCHEDULE', 'Thêm, sửa, xóa các mục lịch phát hành sách'),
    ('00000000-0000-0000-0001-000000000007', 'SCHEDULE_OCR', 'Quét OCR lịch AI', 'SCHEDULE', 'Sử dụng AI Vision để quét ảnh lịch phát hành NXB'),
    ('00000000-0000-0000-0001-000000000008', 'BLOG_VIEW', 'Xem bài viết & đọc thử', 'BLOGS', 'Xem bài viết tin tức và các bản đọc thử'),
    ('00000000-0000-0000-0001-000000000009', 'BLOG_MANAGE', 'Quản lý bài viết', 'BLOGS', 'Đăng bài viết, tạo mẫu đọc thử manga/sách'),
    ('00000000-0000-0000-0001-000000000010', 'PROMO_VIEW', 'Xem khuyến mãi', 'PROMOTIONS', 'Xem voucher giảm giá và sự kiện flash sale'),
    ('00000000-0000-0000-0001-000000000011', 'PROMO_MANAGE', 'Quản lý khuyến mãi', 'PROMOTIONS', 'Tạo mới mã giảm giá, cấu hình khung giờ Flash Sale'),
    ('00000000-0000-0000-0001-000000000012', 'USER_VIEW', 'Xem danh sách người dùng', 'USERS', 'Xem thông tin khách hàng và lịch sử hoạt động'),
    ('00000000-0000-0000-0001-000000000013', 'USER_MANAGE', 'Quản lý tài khoản người dùng', 'USERS', 'Khóa/mở khóa tài khoản, đổi thứ hạng thành viên'),
    ('00000000-0000-0000-0001-000000000014', 'ROLE_MANAGE', 'Quản lý vai trò & phân quyền', 'USERS', 'Tạo vai trò mới và cấu hình ma trận quyền hạn'),
    ('00000000-0000-0000-0001-000000000015', 'STORAGE_MANAGE', 'Quản lý lưu trữ Cloudflare R2', 'SYSTEM', 'Xem thống kê và quét dọn tệp rác Cloudflare R2'),
    ('00000000-0000-0000-0001-000000000016', 'CONFIG_MANAGE', 'Cấu hình sàn & trang chủ', 'SYSTEM', 'Chỉnh sửa layout homepage, banner và cài đặt sàn')
ON CONFLICT (code) DO NOTHING;

-- Seed system roles
INSERT INTO roles (id, code, name, description, color, is_system) VALUES
    ('00000000-0000-0000-0002-000000000001', 'SUPER_ADMIN', 'Quản Trị Tối Cao', 'Toàn quyền điều hành toàn bộ hệ thống Boki', '#EE4D2D', TRUE),
    ('00000000-0000-0000-0002-000000000002', 'STORE_MANAGER', 'Quản Lý Sàn & Kho', 'Quản lý sách, kho hàng, danh mục và lịch phát hành', '#2563EB', FALSE),
    ('00000000-0000-0000-0002-000000000003', 'ORDER_STAFF', 'Nhân Viên Vận Đơn', 'Chuyên trách xử lý đơn hàng, vận chuyển và CSKH', '#059669', FALSE),
    ('00000000-0000-0000-0002-000000000004', 'CONTENT_CREATOR', 'Biên Tập Viên Nội Dung', 'Quản lý bài viết, tin tức manga và các bản đọc thử', '#D97706', FALSE),
    ('00000000-0000-0000-0002-000000000005', 'BUYER', 'Khách Hàng Mua Sách', 'Tài khoản người mua thông thường', '#6B7280', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Assign all permissions to SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0002-000000000001', id FROM permissions
ON CONFLICT DO NOTHING;

-- Assign permissions to STORE_MANAGER (Books, Schedule, Storage)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0002-000000000002', id FROM permissions
WHERE code IN ('BOOK_VIEW', 'BOOK_MANAGE', 'SCHEDULE_VIEW', 'SCHEDULE_MANAGE', 'SCHEDULE_OCR', 'STORAGE_MANAGE')
ON CONFLICT DO NOTHING;

-- Assign permissions to ORDER_STAFF (Orders, User view)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0002-000000000003', id FROM permissions
WHERE code IN ('ORDER_VIEW', 'ORDER_MANAGE', 'USER_VIEW')
ON CONFLICT DO NOTHING;

-- Assign permissions to CONTENT_CREATOR (Blogs, Schedule view)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0002-000000000004', id FROM permissions
WHERE code IN ('BLOG_VIEW', 'BLOG_MANAGE', 'SCHEDULE_VIEW', 'BOOK_VIEW')
ON CONFLICT DO NOTHING;

-- Migrate existing ADMIN users to have SUPER_ADMIN role in user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, '00000000-0000-0000-0002-000000000001'
FROM users u
WHERE u.role = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Migrate existing SELLER users to STORE_MANAGER role in user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, '00000000-0000-0000-0002-000000000002'
FROM users u
WHERE u.role = 'SELLER'
ON CONFLICT DO NOTHING;

-- Migrate existing BUYER users to BUYER role in user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, '00000000-0000-0000-0002-000000000005'
FROM users u
WHERE u.role = 'BUYER'
ON CONFLICT DO NOTHING;
