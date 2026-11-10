# Pull 2 - Setup Migrate Database Thủ Công & Handle Logic Authentication

## Các nội dung đã thực hiện:
- Cấu hình TypeORM và các script **migrate database thủ công** (`add`, `apply`, `revert`, `reset`).
- Tạo migration tạo bảng `users` (`src/database/migrations/1700000000000-CreateUsersTable.ts`) và Entity `User` (`@Exclude()` cho cột `password`).
- Tích hợp **Redis** (`ioredis`) để lưu trữ **blacklist token** khi người dùng đăng xuất.
- Xây dựng đầy đủ luồng Authentication với JWT & Passport:
  - `POST /api/auth/register`: Đăng ký tài khoản mới (hash password bằng `bcryptjs`).
  - `POST /api/auth/login`: Đăng nhập và cấp phát `accessToken` (JWT).
  - `POST /api/auth/logout`: Đăng xuất và đưa token hiện tại vào Redis blacklist (`blacklist:<token>`).
  - `GET /api/auth/me`: Lấy thông tin người dùng hiện tại (Get Current User), kiểm tra JWT hợp lệ và không nằm trong Redis blacklist.
- Cập nhật Swagger Bearer Auth tại `/api/docs`.

## Các lệnh Migration Database thủ công:
```bash
# 1. Add (tạo mới file migration thủ công)
npm run migration:create -- src/database/migrations/TenMigration

# 2. Apply (chạy migration lên database)
npm run migration:run

# 3. Revert (hoàn tác migration gần nhất)
npm run migration:revert

# 4. Reset (xóa schema và chạy lại toàn bộ migration từ đầu)
npm run migration:reset
```

## Chạy dự án & Kiểm thử:
```bash
# Chạy migration tạo bảng users
npm run migration:run

# Chạy server ở chế độ dev
npm run start:dev

# Kiểm tra code style (SunLint / Prettier)
npm run lint

# Chạy Unit Test & E2E Test
npm test
npm run test:e2e
```
