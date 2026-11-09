# Pull 1 - init project với NestJS + 1 api hello world + setup i18n + setup swagger

## 📌 Các nội dung đã thực hiện:
- Khởi tạo project NestJS với kiến trúc module chuẩn.
- Cấu hình global prefix `/api`.
- Tích hợp Swagger Documentation tại `/api/docs`.
- Tích hợp đa ngôn ngữ `nestjs-i18n` hỗ trợ Tiếng Anh (`/api/hello?lang=en`) và Tiếng Việt (`/api/hello?lang=vi`).
- Thêm endpoint `GET /api/hello` trả về lời chào localized.
- Cấu hình kiểm tra chuẩn code SunLint / Prettier.

---

## 📸 Kết quả kiểm thử:
- `GET /api/hello` -> `Hello World!`
- `GET /api/hello?lang=vi` -> `Xin chào thế giới!`
- Truy cập `http://localhost:3000/api/docs` hiển thị giao diện Swagger UI.
- `npm run lint` pass 100% (0 errors, 0 warnings).
- `npm run build` thành công.
- `npm test` & `npm run test:e2e` pass 100%.

---

## 🛠️ Hướng dẫn cài đặt & chạy thử:
```bash
# Cài đặt dependencies
npm install

# Kiểm tra lint
npm run lint

# Build project
npm run build

# Chạy server ở chế độ dev
npm run start:dev
```
- Endpoint API: `http://localhost:3000/api/hello`
- Swagger UI: `http://localhost:3000/api/docs`
