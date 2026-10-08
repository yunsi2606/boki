# BOKI — TOÀN BỘ QUY CHUẨN STYLE & RÀNG BUỘC PHÁT TRIỂN (CONSTRAINTS)

> **Tài liệu chuẩn hóa toàn bộ các ràng buộc cốt lõi được thống nhất từ trước tới nay.**
> Mọi lập trình viên và trợ lý AI (Gemini/Claude) bắt buộc phải tuân thủ nghiêm ngặt khi phát triển hệ thống Boki.

---

## 1. RÀNG BUỘC KÍCH THƯỚC FILE & KIẾN TRÚC MODULAR
- **Giới hạn cứng**: Mọi file (`.java`, `.ts`, `.tsx`, `.css`) **tuyệt đối KHÔNG vượt quá 250 dòng**.
- **Nguyên tắc tách file**:
  - Chia nhỏ UI thành các sub-components (Modal, Table, Cards, Filters, Actions...).
  - Tách logic nghiệp vụ sang custom hooks (`use...`) hoặc service helpers.
  - Tách riêng DTOs, Mappers, Enums, Constants, Interfaces/Types sang file riêng.
  - Dùng CSS Module cho từng sub-component, tránh dồn hàng trăm dòng CSS vào một file.

---

## 2. QUY CHUẨN MÀU SẮC & HỆ THỐNG DESIGN TOKENS
Hệ thống sử dụng bảng màu thương hiệu chuẩn (`web/src/styles/tokens.css`):
- **Primary Color (Rose Coral & Crimson)**:
  - Màu chủ đạo: `#EE4D2D` (`--color-primary-500`), hover: `#D83A1B` (`--color-primary-600`).
  - Sử dụng cho: CTA chính, giá nổi bật, banner flash sale, active tabs/links, viền focus.
- **Secondary Color (Warm Amber & Golden Sun)**:
  - Màu phụ: `#FF9800` (`--color-secondary-500`), `#FFA726` (`--color-secondary-400`).
  - Sử dụng cho: Đồng hồ countdown Flash Sale, ngôi sao đánh giá, huy hiệu Top 1-10, combo tiết kiệm.
- **Accent Color (Blush Pink)**:
  - Màu phụ trợ: `#FFF5F7` (`--color-pink-50`), `#FFE4E8` (`--color-pink-100`), `#FF6B81` (`--color-pink-500`).
  - Sử dụng cho: Tag giảm giá nhẹ nhàng, badge ưu đãi sách thiếu nhi/truyện tranh.
- **Neutral Palette (Crisp Light Theme)**:
  - Nền trang web (Body canvas): `#F8F9FA` (`--color-neutral-50`).
  - Nền thẻ / block card: `#FFFFFF` (`--color-neutral-100`).
  - Input, sub-panels: `#F1F3F5` (`--color-neutral-200`).
  - Đường viền (Borders & Dividers): `#E9ECEF` (`--color-neutral-300`), muted `#CED4DA`.
  - Phân cấp chữ (Typography):
    - Tiêu đề đậm: `#111827` (`--color-neutral-900`) & `#212529` (`--color-neutral-800`).
    - Nội dung chính (Body): `#343A40` (`--color-neutral-700`).
    - Phụ đề / tác giả: `#495057` (`--color-neutral-600`) & `#868E96` (`--color-neutral-500`).
- **Typography & Bo góc (Radius)**:
  - Phông chữ chuẩn: `'Plus Jakarta Sans', -apple-system, sans-serif`.
  - Bo góc: 6px (`--radius-sm`), 10px (`--radius-md`), 14px (`--radius-lg`), pill 9999px.

---

## 3. QUY CHUẨN ICON, LOGO & TYPOGRAPHY
- **Hạn chế tối đa icon**: Tuyệt đối KHÔNG lạm dụng icon bừa bãi (kể cả icon từ thư viện như `lucide-react`) vì sẽ tạo cảm giác giao diện sơ sài, rẻ tiền giống sản phẩm do AI sinh tự động.
- **Ưu tiên nhận diện chuẩn**: Sử dụng Typography phân cấp tinh tế, nhãn chữ rõ ràng (Text labels), huy hiệu thương hiệu (Brand badges) hoặc Logo chính thức (nếu cần người dùng sẽ cung cấp/tạo logo).
- **Khi bắt buộc phải có icon**: Chỉ sử dụng icon vector SVG stroke chuẩn cho các hành động chức năng thiết yếu (như đóng mở menu, giỏ hàng, tìm kiếm).
- **Tuyệt đối cấm**:
  - Không sử dụng icon dạng text (ví dụ: `[x]`, `+`, `->`, `...`, `v`, `^`).
  - Không sử dụng emoji (ví dụ: 🗑️, ⚡, 📦, ❌, ✅, ⚠️).

---

## 4. THIẾT KẾ UI/UX — CHỐNG "AI OVER-DESIGN"
- **Phong cách chủ đạo**: Sàn sách bản quyền hiện đại, tinh tế, tối giản, cân đối và chuẩn mực.
- **Tránh phong cách AI làm quá**:
  - Không dùng màu sắc lòe loẹt, gradients quá đà, hiệu ứng neon/glow bóng bẩy kỳ dị.
  - Tôn vinh vẻ đẹp tự nhiên của bìa sách thay vì để UI lấn át sản phẩm.
- **Khả năng đáp ứng (Responsive & Layout)**:
  - Thiết kế Mobile-first và cân đối trên Desktop.
  - Modal, bộ lọc, menu không được làm che khuất nút bấm (CTA), form hoặc tràn viền trên mobile.
  - Bảng xếp hạng / list ngang cho phép scroll nhưng phải ẩn scrollbar mặc định (`scrollbar-width: none`).

---

## 5. QUY TRÌNH LÀM VIỆC (WORKFLOW CONTRACT)
- **"Nói trước kế hoạch, khi người dùng đồng ý mới code"**:
  - Trước khi triển khai tính năng hoặc thay đổi logic, AI **bắt buộc** phải trình bày phương án trước:
    1. Kiến trúc & cách giải quyết.
    2. Các file sẽ tạo mới hoặc sửa đổi.
    3. Cấu trúc DB / DTOs / APIs liên quan.
    4. Xử lý các edge cases và rủi ro.
  - **Chỉ bắt đầu code khi người dùng xác nhận** (ví dụ: *"ok làm đi"*, *"phương án 1 đi"*...).

---

## 6. DỮ LIỆU THẬT & HIỆU NĂNG QUERY (ANTI N+1)
- **Nghiêm cấm dữ liệu ảo (No Fake/Mock Data)**:
  - Khi hệ thống đã có DB và API, mọi số liệu (số lượng sách theo danh mục, dải giá, tồn kho, tệp R2...) phải query hoặc tính toán chính xác từ backend. Tuyệt đối không hardcode số liệu ảo.
- **Chống N+1 Query**:
  - Nghiêm cấm query DB trong vòng lặp (`for`/`map`).
  - Bắt buộc dùng `JOIN FETCH`, batch loading (`WHERE id IN (...)`), hoặc subqueries/group by.

---

## 7. CẤU HÌNH TRANG CHỦ ĐỘNG (HOMEPAGE BUILDER)
- Toàn bộ các section hiển thị trên trang chủ:
  - Top sản phẩm bán chạy (Best Sellers - Top 1 -> 10)
  - Flash Sale & Ưu đãi có hạn giờ
  - Danh mục nổi bật (Category showcase)
  - Gợi ý Hot (Personalized / Trending Recommendations)
  - Banners & Bộ sưu tập (Collections)
- **Quy tắc**: Đều phải nằm trong **Cấu hình trang chủ (Admin Homepage Config)**, hỗ trợ bật/tắt, sắp xếp thứ tự hiển thị, thay đổi tiêu đề và điều kiện load dữ liệu linh hoạt (tương tự tính năng trang trí shop của Shopee).

---

## 8. QUY TẮC NGHIỆP VỤ SÁCH, PHÂN LOẠI & DANH MỤC
- **Đa danh mục**: Một cuốn sách có thể thuộc nhiều danh mục (`book_categories` M:N).
- **Xóa danh mục an toàn**: Khi xóa danh mục, chỉ xóa liên kết và bản ghi danh mục, **tuyệt đối không xóa sách**.
- **Ảnh bìa theo ngữ cảnh**:
  - `category_cover_url`: Ảnh bìa sách chuẩn, đơn giản, tỷ lệ đẹp để hiển thị ở mục danh mục.
  - `image_url` / thư viện ảnh: Ảnh chụp sản phẩm thực tế, có thể kèm phụ kiện/quà tặng cho trang chi tiết.
- **Xử lý giá & Phân loại (Variants)**:
  - Có nhiều phân loại: Hiển thị **dải giá (Price Range: Min - Max)**.
  - Không có phân loại hoặc 1 phân loại: Hiển thị giá gốc và giá ưu đãi (nếu có giảm giá).
  - Không tách từng phân loại thành sản phẩm riêng lẻ trên danh sách chung.
- **Đọc thử sách (Sample / Book Preview)**:
  - Kế thừa từ hệ thống Blog, quan hệ Many-to-Many với sản phẩm sách, tạo luồng: *Đọc thử -> Xem sách -> Mua*.
- **Combo sách**:
  - Cho phép kết hợp sản phẩm lẻ hoặc phân loại cụ thể của sản phẩm lẻ, hiển thị tiền tiết kiệm.

---

## 9. QUẢN LÝ LƯU TRỮ CLOUDFLARE R2 & DỌN FILE RÁC
- **Scanner đối soát toàn diện**: Quét toàn bộ bảng media trong DB (`book_images`, `books.category_cover_url`, `blogs.thumbnail_url`, `blogs.content` regex, `users.avatar_url`, `book_variants.image_url`).
- **Bộ đệm an toàn 2 giờ (Grace Period Buffer)**:
  - Tự động bỏ qua các tệp vừa upload trong 2 giờ qua để tránh xóa nhầm ảnh đang soạn thảo.

---

## 10. KIẾN TRÚC BACKEND (CLEAN ARCHITECTURE & HEXAGONAL PORTS)
- **Domain Layer**: Độc lập tuyệt đối với framework (Entities, Value Objects, Domain Ports).
- **Application Layer**: Use-case driven (không generic CRUD), DTOs, Mappers, Transaction Management.
- **Infrastructure Layer**: Triển khai Ports (JPA Repositories, R2 S3Client, Firebase Auth, External APIs).
- **Interface Layer**: REST Controllers mỏng, chỉ parse request, validate boundary và map response. **Cấm business logic trong Controller.**
- **Security**: JWT Authentication, bắt buộc xác thực số điện thoại sau khi đăng nhập.

---

## 11. KIỂM THỬ & CHẤT LƯỢNG MÃ NGUỒN
- Luôn kiểm tra build backend (`mvn compile -DskipTests`) và frontend (`npx tsc --noEmit`) sau khi hoàn thành.
- Giữ lịch sử Git sạch, áp dụng Conventional Commits: `type(scope): message`.
