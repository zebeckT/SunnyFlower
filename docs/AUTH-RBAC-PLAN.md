# Kế hoạch đăng nhập, đăng ký thành viên và phân quyền — SunnyFlower

**Phiên bản:** 1.0  
**Phạm vi:** ASP.NET Core API + React frontend  
**Mục tiêu:** hỗ trợ đăng ký thành viên, đăng nhập theo nhiều vai trò và kiểm soát quyền nhất quán ở cả backend lẫn frontend.

## 1. Hiện trạng

Hệ thống đã có:

- Ba role: `admin`, `staff`, `customer`.
- JWT chứa claim `role` và nhiều claim `permission`.
- API `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`.
- Đăng ký công khai luôn gán role `customer`.
- `admin` và `staff` được bảo vệ bằng permission tại các endpoint quản trị.
- Frontend đã lưu phiên, kiểm tra `expiresAt` và logout khi API trả 401.

Khoảng trống cần hoàn thiện:

- Chưa có màn hình đăng ký/đăng nhập dành cho khách hàng.
- Màn hình `AdminLogin` đang dùng chung AuthContext nhưng điều hướng mọi tài khoản đã đăng nhập tới `/admin`; customer có thể rơi vào vòng lặp `/admin` ↔ `/admin/login`.
- Frontend mới bảo vệ admin theo `isStaff`, chưa kiểm soát từng chức năng theo permission.
- Chưa có API quản trị người dùng để admin tạo staff, đổi role hoặc khóa tài khoản.
- Customer chưa có khu vực tài khoản và chưa có cơ chế xem đơn hàng của chính mình.

## 2. Nguyên tắc phân quyền

1. Backend là nguồn quyết định quyền cuối cùng. Ẩn nút trên frontend không thay thế authorization tại API.
2. Đăng ký công khai không nhận `role` từ client; tài khoản mới luôn là `customer`.
3. Chỉ `admin` có `users.manage` mới được tạo staff, đổi role và khóa/mở tài khoản.
4. Dùng permission để bảo vệ chức năng; role chủ yếu dùng để nhóm permission và chọn giao diện sau đăng nhập.
5. Không hardcode mật khẩu mẫu hoặc tự động điền credential trong production.
6. Token hết hạn, tài khoản bị khóa hoặc API trả 401 phải xóa phiên và chuyển về trang đăng nhập phù hợp.
7. Không cho admin tự hạ role hoặc khóa chính mình nếu hệ thống không còn admin hoạt động khác.

## 3. Ma trận role và permission

| Chức năng | Guest | Customer | Staff | Admin |
|---|:---:|:---:|:---:|:---:|
| Xem sản phẩm/danh mục | ✓ | ✓ | ✓ | ✓ |
| Tạo đơn hàng | ✓ | ✓ | ✓ | ✓ |
| Đăng ký/đăng nhập | ✓ | — | — | — |
| Xem/sửa hồ sơ cá nhân | — | ✓ | ✓ | ✓ |
| Xem đơn của chính mình | — | ✓ | ✓ | ✓ |
| Quản lý sản phẩm | — | — | `products.manage` | ✓ |
| Quản lý danh mục | — | — | Không mặc định | `categories.manage` |
| Xem đơn toàn hệ thống | — | — | `orders.read` | ✓ |
| Cập nhật trạng thái đơn | — | — | `orders.update` | ✓ |
| Xem liên hệ khách hàng | — | — | `contacts.read` | ✓ |
| Quản lý người dùng/role | — | — | — | `users.manage` |

Permission đề xuất bổ sung:

- `profile.read`, `profile.update` — hoặc coi đây là quyền mặc định của người đã đăng nhập.
- `orders.own.read` — xem đơn gắn với chính tài khoản customer.
- Chỉ thêm permission mới khi backend thực sự cần policy riêng; tránh tạo permission nhưng không dùng.

## 4. Luồng đăng nhập theo role

### 4.1 Một API đăng nhập dùng chung

`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

Response giữ cấu trúc hiện tại:

```json
{
  "token": "jwt",
  "expiresAt": "2026-10-05T12:00:00Z",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "customer",
    "permissions": []
  }
}
```

### 4.2 Điều hướng sau đăng nhập

| Role | Trang mặc định |
|---|---|
| `admin` | `/admin` |
| `staff` | `/admin` nhưng menu chỉ hiện chức năng có permission |
| `customer` | `/tai-khoan` hoặc quay lại trang trước đăng nhập |

Quy tắc:

- `/dang-nhap` chấp nhận mọi role.
- `/admin/login` chỉ dành cho admin/staff. Nếu customer đăng nhập tại đây, hiển thị “Tài khoản không có quyền quản trị”, logout phiên vừa tạo hoặc chuyển tới `/tai-khoan`; không redirect vòng lặp.
- `ProtectedRoute` nhận `requiredPermissions` thay vì chỉ kiểm tra `isStaff`.
- Nếu đã đăng nhập nhưng thiếu quyền: hiển thị trang 403, không chuyển về login như thể chưa xác thực.

## 5. Luồng đăng ký thành viên mới

### 5.1 Màn hình `/dang-ky`

Trường dữ liệu:

- Họ và tên — bắt buộc, 2–100 ký tự.
- Email — bắt buộc, normalize lowercase/trim.
- Mật khẩu — tối thiểu 8 ký tự, có chữ và số; backend và frontend phải dùng cùng quy tắc.
- Xác nhận mật khẩu — chỉ gửi mật khẩu chính tới API.
- Checkbox đồng ý điều khoản/chính sách — nếu dự án có tài liệu tương ứng.

Hành vi:

- Disable nút và hiển thị loading trong khi gửi.
- HTTP 409: “Email đã được sử dụng”.
- HTTP 400: map validation theo field.
- Thành công: tự đăng nhập bằng token response rồi chuyển `/tai-khoan`, hoặc chuyển `/dang-nhap?registered=1` nếu không muốn auto-login.
- Không cho client gửi hoặc lựa chọn role.

### 5.2 Backend đăng ký

Giữ `POST /api/auth/register`, bổ sung:

- Validate `FullName`, email, password thống nhất.
- Unique index email và xử lý race condition khi hai request đăng ký đồng thời.
- Rate limit theo IP/email.
- Không tiết lộ email tồn tại trong luồng quên mật khẩu; riêng đăng ký có thể trả 409 rõ ràng.
- Tùy giai đoạn sau: xác minh email trước khi cho đăng nhập.

## 6. Quản lý user và role dành cho admin

Thêm nhóm endpoint `/api/admin/users`, yêu cầu `users.manage`:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/admin/users?page=&search=&role=&isActive=` | Danh sách người dùng |
| GET | `/api/admin/users/{id}` | Chi tiết người dùng |
| POST | `/api/admin/users` | Admin tạo staff/customer |
| PATCH | `/api/admin/users/{id}/role` | Đổi role |
| PATCH | `/api/admin/users/{id}/status` | Khóa/mở tài khoản |
| POST | `/api/admin/users/{id}/reset-password` | Cấp link/token reset; không trả mật khẩu thô |

Màn hình `/admin/users`:

- Bảng tên, email, role, trạng thái, ngày tạo.
- Lọc role/trạng thái, tìm kiếm, phân trang.
- Dialog tạo tài khoản nhân viên.
- Dialog đổi role và khóa tài khoản có xác nhận.
- Chỉ render menu/màn hình khi `hasPermission('users.manage')`.

## 7. Customer account

Thêm layout `/tai-khoan`:

- `/tai-khoan` — thông tin cá nhân.
- `/tai-khoan/don-hang` — đơn hàng của chính customer.
- `/tai-khoan/doi-mat-khau` — đổi mật khẩu.

Để xem đơn của chính mình an toàn:

- Thêm nullable `UserId` vào `Order` để vẫn hỗ trợ guest checkout.
- Khi tạo đơn có JWT hợp lệ, backend tự lấy user id từ token; không nhận `userId` từ body.
- Endpoint `GET /api/me/orders` chỉ query `Order.UserId == currentUserId`.
- Không cho customer truy cập `GET /api/orders/{id}` quản trị.

## 8. Thay đổi frontend

### AuthContext

- Thêm `register()`, `refreshProfile()` và `changePassword()`.
- Chuẩn hóa `login()` trả về user/role để router chọn redirect.
- `hasPermission()` phải trả false nếu phiên đã hết hạn.
- Dùng một API client chung để tự gắn bearer token và phát sự kiện logout khi nhận 401.

### Route guard

Ví dụ thiết kế:

```jsx
<Route element={<RequireAuth />}>
  <Route path="/tai-khoan/*" element={<AccountLayout />} />
</Route>

<Route element={<RequirePermission anyOf={['orders.read', 'products.manage']} />}>
  <Route path="/admin" element={<AdminLayout />} />
</Route>

<Route element={<RequirePermission allOf={['users.manage']} />}>
  <Route path="/admin/users" element={<AdminUsers />} />
</Route>
```

### Header

- Guest: “Đăng nhập”, “Đăng ký”.
- Customer: tên người dùng, “Tài khoản”, “Đơn hàng”, “Đăng xuất”.
- Staff/Admin: thêm link “Quản trị”.
- Mobile Drawer phải có cùng quyền và chức năng với desktop.

## 9. Bảo mật bắt buộc

- Password hash tiếp tục dùng PBKDF2 với salt riêng; cấu hình iteration đủ mạnh và có khả năng nâng cấp hash.
- JWT key chỉ lấy từ secret/environment, không commit vào repository.
- Rate limit login/register và lock tạm thời sau nhiều lần đăng nhập sai.
- Thông báo login luôn là “Email hoặc mật khẩu không đúng”, không tiết lộ tài khoản tồn tại.
- Cân nhắc lưu token trong HttpOnly Secure SameSite cookie thay cho localStorage khi triển khai production.
- Cấu hình CORS theo domain cụ thể; bắt buộc HTTPS production.
- Ghi audit log khi admin đổi role, khóa tài khoản hoặc reset mật khẩu.
- Revoke/đổi token khi user bị khóa, đổi mật khẩu hoặc bị thay role; không chỉ chờ JWT hết hạn.

## 10. Kế hoạch triển khai theo giai đoạn

### Giai đoạn 1 — Hoàn thiện auth nền tảng

- Chuẩn hóa validation login/register.
- Tách `/dang-nhap` và `/admin/login`.
- Sửa redirect theo role và thêm trang 401/403.
- Refactor guard theo permission.
- Viết test backend/frontend cho login từng role.

**Definition of Done:** admin/staff/customer đăng nhập đúng landing page; customer không thể vào admin; thiếu quyền trả 403; không có redirect loop.

### Giai đoạn 2 — Đăng ký và tài khoản customer

- Xây `/dang-ky`, nối `POST /api/auth/register`.
- Xây `/tai-khoan` và cập nhật Header.
- Thêm đổi mật khẩu và cập nhật profile.
- Gắn `UserId` vào đơn và xây “Đơn hàng của tôi”.

**Definition of Done:** khách đăng ký thành công thành role customer, đăng nhập được, xem/sửa hồ sơ và chỉ xem đơn của mình.

### Giai đoạn 3 — Quản lý user/role

- Xây API `/api/admin/users`.
- Xây màn hình `/admin/users`.
- Thêm chống tự khóa admin cuối cùng và audit log.
- Test đầy đủ ma trận permission.

**Definition of Done:** chỉ admin có `users.manage` quản lý tài khoản; staff không truy cập được; thay role/status có audit và hiệu lực với phiên hiện tại.

### Giai đoạn 4 — Hardening

- Rate limit, lockout, email verification, forgot/reset password.
- Chuyển token sang cookie nếu phù hợp kiến trúc deployment.
- E2E, accessibility, security test và logging/monitoring.

## 11. Test plan tối thiểu

### Authentication

- Đăng ký hợp lệ, email trùng, email sai, password yếu, confirm password sai.
- Login đúng/sai cho từng role; tài khoản bị khóa; token hết hạn.
- Refresh trang vẫn giữ phiên hợp lệ; logout xóa toàn bộ dữ liệu phiên.

### Authorization

- Guest gọi endpoint protected → 401.
- Customer gọi admin API → 403.
- Staff chỉ truy cập đúng permission được cấp.
- Admin truy cập toàn bộ chức năng.
- UI không hiện action thiếu quyền, đồng thời gọi API trực tiếp vẫn bị backend chặn.

### User management

- Admin tạo staff/customer, đổi role, khóa/mở tài khoản.
- Staff không được gọi API quản lý user.
- Không thể khóa/hạ quyền admin hoạt động cuối cùng.
- Email unique được đảm bảo khi request đồng thời.

### Customer data isolation

- Customer A không đọc được hồ sơ/đơn của Customer B bằng cách sửa URL hoặc id.
- Guest order không bị lộ qua account endpoint.
- Đổi role/khóa user làm phiên cũ mất hiệu lực theo thiết kế.

## 12. Tiêu chí nghiệm thu release

- 100% endpoint mutation có authorization policy phù hợp.
- Toàn bộ test ma trận role/permission pass.
- Không có redirect loop giữa login và protected route.
- Public registration luôn tạo `customer` dù payload cố gửi role khác.
- Customer không đọc hoặc sửa được dữ liệu của người khác.
- Build, lint, unit test, integration test và E2E đều pass.
- Không hardcode credential, JWT key hoặc dữ liệu nhạy cảm trong source/build.

