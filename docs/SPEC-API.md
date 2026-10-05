# SPEC-API — SunnyFlower (REST JSON, tiếng Việt, tiền VND)

Base URL: `/api`. Content-Type `application/json; charset=utf-8`. Tiền = số nguyên VND. Thời gian ISO-8601 UTC. Không cần auth.
Dữ liệu mẫu: `docs/products.sample.json` (10 SP + 4 danh mục). Lưu trữ gợi ý: in-memory/JSON file, đơn hàng ghi trong bộ nhớ.

## 1. Lược đồ dữ liệu
**Category**: `id` (slug, PK) · `name` · `description` · `image` (URL)
**Product**: `id` (slug, PK) · `name` · `description` · `price` (int VND, >0) · `image` (URL) · `images` (string[]) · `categoryId` (FK Category) · `stock` (int ≥0) · `featured` (bool) · `createdAt`
**Order**: `id` (vd `SF-20261002-0001`) · `status` (`pending|confirmed|shipping|completed|cancelled`) · `paymentMethod` (`cod|bank_transfer`) · `subtotal` · `shippingFee` · `total` · `note` · `shipping` (ShippingInfo) · `items` (OrderItem[]) · `createdAt`
**OrderItem** (snapshot tại thời điểm mua): `productId` · `name` · `image` · `unitPrice` · `quantity` (1–20) · `lineTotal`
**ShippingInfo**: `fullName` · `phone` (VN: `^(0|\+84)\d{9}$`) · `email?` · `address` · `ward?` · `district` · `city` · `deliveryDate?` (YYYY-MM-DD, ≥ hôm nay) · `cardMessage?` (≤200 ký tự)

Quy tắc: `shippingFee` = 0 nếu subtotal ≥ 500000, ngược lại 30000. `total = subtotal + shippingFee`. Server tính lại giá từ DB, KHÔNG tin giá từ client. Tạo đơn trừ `stock`.

## 2. Định dạng lỗi (chung)
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Dữ liệu không hợp lệ", "details": [ { "field": "shipping.phone", "message": "Số điện thoại không hợp lệ" } ] } }
```
| HTTP | code | Khi nào |
|---|---|---|
| 400 | `VALIDATION_ERROR` | body/query sai (có `details`) |
| 404 | `NOT_FOUND` | không có product/order/category |
| 409 | `OUT_OF_STOCK` | tồn kho không đủ (`details`: `{productId, requested, available}`) |
| 500 | `INTERNAL_ERROR` | lỗi server |

## 3. Endpoints

### GET /api/products
Query (tất cả tùy chọn): `category` (categoryId) · `q` (tìm theo tên, không phân biệt dấu/hoa) · `minPrice`, `maxPrice` (int) · `featured` (`true`) · `sort` (`price_asc|price_desc|newest|name`, mặc định `newest`) · `page` (≥1, mặc định 1) · `limit` (1–50, mặc định 12).
200:
```json
{ "data": [ { "id": "bo-hong-do-20-bong", "name": "Bó hồng đỏ 20 bông", "price": 650000, "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800", "categoryId": "hoa-hong", "stock": 15, "featured": true } ],
  "meta": { "page": 1, "limit": 12, "total": 10, "totalPages": 1 } }
```
(List trả bản rút gọn: id, name, price, image, categoryId, stock, featured.) 400 nếu query sai.

### GET /api/products/:id
200: `{ "data": { ...Product đầy đủ (có description, images, createdAt) } }` · 404 `NOT_FOUND`.

### GET /api/categories
200: `{ "data": [ { "id": "hoa-hong", "name": "Hoa hồng", "description": "...", "image": "...", "productCount": 3 } ] }`

### POST /api/orders
Request:
```json
{ "items": [ { "productId": "bo-hong-do-20-bong", "quantity": 2 } ],
  "paymentMethod": "cod",
  "shipping": { "fullName": "Nguyễn Thị Lan", "phone": "0901234567", "email": "lan@example.com", "address": "12 Nguyễn Huệ", "ward": "Bến Nghé", "district": "Quận 1", "city": "TP. Hồ Chí Minh", "deliveryDate": "2026-10-05", "cardMessage": "Chúc mừng sinh nhật mẹ!" },
  "note": "Gọi trước khi giao" }
```
Bắt buộc: `items` (≥1, productId không trùng), `paymentMethod`, `shipping.fullName/phone/address/district/city`.
201 (+ header `Location: /api/orders/SF-20261002-0001`):
```json
{ "data": { "id": "SF-20261002-0001", "status": "pending", "paymentMethod": "cod", "subtotal": 1300000, "shippingFee": 0, "total": 1300000, "note": "Gọi trước khi giao",
  "shipping": { "fullName": "Nguyễn Thị Lan", "phone": "0901234567", "address": "12 Nguyễn Huệ", "district": "Quận 1", "city": "TP. Hồ Chí Minh", "deliveryDate": "2026-10-05" },
  "items": [ { "productId": "bo-hong-do-20-bong", "name": "Bó hồng đỏ 20 bông", "image": "...", "unitPrice": 650000, "quantity": 2, "lineTotal": 1300000 } ],
  "createdAt": "2026-10-02T03:15:00.000Z" } }
```
Lỗi: 400 `VALIDATION_ERROR` · 404 `NOT_FOUND` (productId không tồn tại, `details.field = items[i].productId`) · 409 `OUT_OF_STOCK`.

### GET /api/orders/:id
200: `{ "data": Order }` (như trên) · 404 `NOT_FOUND`.

## 4. Test gợi ý (tester)
Phân trang/sắp xếp/lọc; `q` có dấu & không dấu ("hong"); id không tồn tại → 404; POST thiếu phone/sai phone → 400; quantity 0 hoặc 21 → 400; quantity > stock → 409 và stock không đổi; subtotal 650000 → phí 0, 300000 → phí 30000; giá client gửi lên bị bỏ qua.
