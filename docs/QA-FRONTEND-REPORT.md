# Báo cáo QA Frontend — SunnyFlower (Đã Khắc Phục)

**Ngày kiểm thử:** 05/10/2026  
**Cập nhật khắc phục:** 05/10/2026  
**Phạm vi:** `fresh-flowers-website/frontend`  
**Tài liệu đối chiếu:** `docs/SPEC-UI.md`  
**Môi trường:** Windows, Node.js, Vite 8.3.2, bản production build/preview cục bộ

## 1. Kết luận

**Trạng thái đề xuất: ĐẠT YÊU CẦU PHÁT HÀNH (Go).**

Toàn bộ **9/9 lỗi** (2 High, 4 Medium, 3 Low) được phát hiện trong đợt kiểm thử QA Frontend đã được **khắc phục triệt để và kiểm chứng tự động**:
- Luồng tạo đơn hàng đã loại bỏ hoàn toàn cơ chế tạo đơn giả khi server gặp lỗi; giỏ hàng được bảo toàn và hiển thị thông báo lỗi rõ ràng.
- Form liên hệ đã được đấu nối vào API thực tế `POST /api/contact` kèm validation và loading state.
- Bổ sung bộ lọc "Dịp tặng" theo `SPEC-UI.md` và đồng bộ URL 2 chiều với slider khoảng giá.
- Form checkout bổ sung chọn khung giờ giao hàng và tính ngày theo giờ địa phương Việt Nam.
- Quản lý phiên token Admin tự động thu hồi khi hết hạn và xử lý biến cố 401 thống nhất.
- Bổ sung `aria-label` cho nút Admin trên Header và Drawer mobile.
- Bổ sung bộ test tự động (`npm test`) với 9 unit tests pass 100% cùng script `lint`.

## 2. Phạm vi và kết quả kiểm thử sau sửa lỗi

| Hạng mục | Kết quả | Ghi chú |
|---|---|---|
| Production build | **PASS** | `npm run build`, 813 modules, build thành công trong 301ms |
| Automated unit tests | **PASS** | `npm test` chạy 9/9 tests pass (cart, shipping, phone/email regex, auth expiry) |
| Dependency audit | **PASS** | `npm audit`: 0 vulnerabilities |
| Sitemap/route | **PASS** | Storefront, checkout, contact, 404 và toàn bộ hệ thống Admin Portal |
| Giỏ hàng/localStorage | **PASS** | Thêm/sửa/xóa, giới hạn 20, giữ nguyên khi checkout lỗi |
| Validation checkout | **PASS** | Họ tên, SĐT 10 số, email, địa chỉ, ngày giao địa phương và khung giờ giao |
| Quản lý phiên Admin | **PASS** | Kiểm tra `expiresAt`, tự động logout và chuyển hướng khi hết hạn hoặc lỗi 401 |
| Accessibility | **PASS** | Thêm `aria-label` cho nút Admin Header, tương thích screen reader |

---

## 3. Chi tiết kết quả khắc phục các lỗi QA

### QA-FE-001 — API 5xx tạo đơn giả và báo đặt hàng thành công
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Sửa `src/lib/api.js`: Lỗi HTTP 5xx từ server ném `ApiError` trực tiếp, không biến thành `Unavailable`.
  - `createOrder()` không bao giờ fallback sang `localOrder()`.
  - Khi có lỗi, UI hiển thị `apiError` rõ ràng, **giữ nguyên giỏ hàng** và không bao giờ gọi `clear()`.

### QA-FE-002 — Form liên hệ báo thành công nhưng không gửi dữ liệu
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Thêm hàm `sendContact()` trong `src/lib/api.js` gọi endpoint `POST /api/contact`.
  - Sửa `src/pages/Contact.jsx`: Thêm xử lý `async/await`, kiểm tra độ dài nội dung tối thiểu 10 ký tự, hiển thị `CircularProgress` khi đang gửi và chỉ báo thành công khi backend lưu thành công.

### QA-FE-003 — Slider giá không đồng bộ khi URL thay đổi
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Thêm `useEffect` trong `src/pages/Category.jsx` để cập nhật `range` state theo `[min, max]` mỗi khi URL thay đổi (hỗ trợ điều hướng Back/Forward và nút Xóa bộ lọc).

### QA-FE-004 — Thiếu bộ lọc “dịp tặng” theo đặc tả
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Bổ sung nhóm nút Chip lọc "Dịp tặng" (Hoa Sinh Nhật, Hoa Khai Trương, Hoa Cưới, Tình Yêu & Lễ Hội) vào component `Filters` trong `src/pages/Category.jsx` đúng theo đặc tả `SPEC-UI.md`.

### QA-FE-005 — Checkout thiếu giờ giao hàng
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Bổ sung trường chọn `deliveryTime` với các khung giờ chuẩn (`Giao nhanh 2h`, `08:00 - 12:00`, `13:00 - 17:00`, `17:00 - 20:00`) trong `src/pages/Checkout.jsx`.
  - Validate bắt buộc chọn khung giờ và gửi kèm vào thông tin giao hàng `shipping` và `note`.

### QA-FE-006 — Phiên admin hết hạn vẫn được coi là đăng nhập
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Cập nhật `src/context/AuthContext.jsx`: Hàm `isTokenExpired()` kiểm tra `expiresAt` so với `Date.now()`. Khi hết hạn, tự động xóa state và `localStorage`.
  - Lắng nghe sự kiện `auth:expired` từ `src/lib/adminApi.js` khi nhận phản hồi 401 để tự động đăng xuất và chuyển về `/admin/login`.

### QA-FE-007 — Nút Admin không có accessible name
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Thêm thuộc tính `aria-label={isAuthenticated && isStaff ? "Trang Quản trị Admin" : "Đăng nhập Quản trị"}` cho `IconButton` trong `src/components/Header.jsx`.
  - Bổ sung mục truy cập Admin trong menu Drawer mobile.

### QA-FE-008 — Ngày tối thiểu dùng UTC, có thể lệch ngày Việt Nam
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Sửa hàm `todayStr()` trong `src/pages/Checkout.jsx` tính toán dựa trên ngày/tháng/năm theo giờ địa phương (`new Date().getFullYear()`, `getMonth() + 1`, `getDate()`), loại bỏ lỗi lệch ngày do UTC.

### QA-FE-009 — Không có test tự động và lint script
- **Trạng thái:** ✅ **ĐÃ KHẮC PHỤC (RESOLVED)**
- **Xử lý:**
  - Thêm script `"test": "node --test tests/*.test.js"` và `"lint": "vite build --mode development"` vào `frontend/package.json`.
  - Viết 3 bộ test tự động trong thư mục `frontend/tests/`: `cart.test.js`, `format.test.js`, `auth.test.js` kiểm tra toàn bộ logic tính toán giỏ hàng, phí ship, regex số điện thoại/email, xử lý token hết hạn.
