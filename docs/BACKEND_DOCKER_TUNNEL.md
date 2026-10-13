# HƯỚNG DẪN TRIỂN KHAI DOCKER & CLOUDFLARE TUNNEL (BACKEND BOKI)

Tài liệu hướng dẫn triển khai **Backend (Spring Boot)** kết nối an toàn với **Frontend (Vercel)** thông qua **Cloudflare Tunnel (cloudflared)** mà không cần mở cổng modem (No Port Forwarding), có sẵn chứng chỉ SSL/HTTPS và tối ưu hiệu năng.

---

## 1. Kiến Trúc & Luồng Dữ Liệu

```
[ Khách hàng ] 
      │ (HTTPS)
      ▼
[ Vercel Frontend ] ──(API Requests)──► [ Cloudflare Edge Network ]
                                                     │ (QUIC / HTTP/3 Encrypted)
                                                     ▼
                                            [ boki-cloudflared (Docker) ]
                                                     │ (Local Bridge Network)
                                                     ▼
                                            [ boki-backend (Spring Boot:8080) ]
                                                     │
                                                     ▼
                                            [ Supabase PostgreSQL ]
```

- **An toàn tuyệt đối**: Cổng 8080 của máy chủ không mở công khai ra internet (`127.0.0.1:8080`). Toàn bộ lưu lượng từ Vercel bắt buộc đi qua Cloudflare Edge.
- **Tối ưu độ trễ**: Cloudflare Tunnel chạy giao thức QUIC (HTTP/3) giúp kết nối song song và giảm độ trễ tối đa.

---

## 2. Hướng Dẫn Cấu Hình 3 Bước

### Bước 1: Tạo Cloudflare Tunnel trên Cloudflare Dashboard
1. Truy cập [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Chọn menu **Networks** -> **Tunnels** -> bấm **Create a Tunnel**.
3. Đặt tên Tunnel (ví dụ: `boki-backend-tunnel`) -> bấm **Save tunnel**.
4. Tại mục **Choose your environment**, chọn **Docker**.
5. Bạn sẽ thấy một đoạn lệnh chứa token dạng:
   ```bash
   docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token eyJh...
   ```
   **Chỉ copy chuỗi token bí mật** phía sau `--token` (bắt đầu bằng `eyJh...`).

### Bước 2: Cấu hình Public Hostname (Định tuyến API)
1. Trong tab **Public Hostname** của Tunnel vừa tạo, bấm **Add a public hostname**.
2. Điền thông tin:
   - **Subdomain**: `api` (hoặc tên tùy chọn)
   - **Domain**: Chọn tên miền của bạn trên Cloudflare (ví dụ: `bokistore.vn`)
   - **Type**: `HTTP`
   - **URL**: `backend:8080` *(Cloudflared và Backend nằm chung Docker network `boki-backend-net` nên trỏ thẳng bằng tên service `backend:8080`)*.
3. Bấm **Save hostname**. Đường dẫn API công khai của bạn sẽ là: `https://api.bokistore.vn`.

### Bước 3: Cấu hình File `.env` và Khởi chạy Docker
1. Mở file [backend/.env](file:///d:/Documents/WorkSpace/ProjectNET/git/boki/backend/.env) (và [.env](file:///d:/Documents/WorkSpace/ProjectNET/git/boki/.env) ở thư mục gốc):
   ```env
   # Dán token lấy được ở Bước 1 vào đây:
   CLOUDFLARE_TUNNEL_TOKEN=eyJh...

   # Điền domain Vercel của bạn vào danh sách CORS (cách nhau bởi dấu phẩy):
   CORS_ORIGINS=https://boki-store.vercel.app,http://localhost:3000,http://localhost:3001
   ```
2. Trên Vercel: Cập nhật biến môi trường `NEXT_PUBLIC_API_URL` trỏ về domain Cloudflare của backend:
   ```env
   NEXT_PUBLIC_API_URL=https://api.bokistore.vn/api
   ```
3. Mở ứng dụng **Docker Desktop** trên máy tính.
4. Chạy lệnh khởi động Docker Compose:
   ```bash
   docker compose up -d
   ```

---

## 3. Các Lệnh Điều Khiển & Giám Sát

- **Xem trạng thái các container**:
  ```bash
  docker compose ps
  ```
- **Xem nhật ký kết nối của Cloudflare Tunnel**:
  ```bash
  docker compose logs -f cloudflared
  ```
  *(Khi thấy log `Registered tunnel connection... connIndex=0,1,2,3` là Tunnel đã hoạt động hoàn hảo)*.
- **Xem nhật ký của Spring Boot Backend**:
  ```bash
  docker compose logs -f backend
  ```
- **Dừng toàn bộ hệ thống**:
  ```bash
  docker compose down
  ```
- **Rebuild lại Backend sau khi chỉnh sửa code**:
  ```bash
  docker compose up -d --build backend
  ```

---

## 4. Các Tiêu Chuẩn Bảo Mật & Hiệu Năng Đã Tích Hợp

1. **Least Privilege**: Container Backend chạy non-root user `boki`. Cloudflared bị tước toàn bộ quyền hệ thống (`cap_drop: ALL`) và bật chế độ file chỉ đọc (`read_only: true`).
2. **Cgroups & JVM Tuning**: Tự động nhận diện RAM container (`-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0`), sử dụng bộ dọn rác hiện đại G1GC (`-XX:+UseG1GC`).
3. **Healthcheck Ready State**: Cloudflared chỉ mở cổng nhận request khi Spring Boot đã trả về trạng thái khỏe mạnh tại endpoint `/api/health`.
