# SPEC-UI — SunnyFlower (React + MUI, tiếng Việt)

## 1. Sitemap
| Route | Trang | Ghi chú |
|---|---|---|
| `/` | Trang chủ | Hero, danh mục nổi bật, bán chạy, lý do chọn, đánh giá |
| `/danh-muc` (`?loai=hoa-hong&sap-xep=gia-tang`) | Danh mục | Lọc + lưới sản phẩm |
| `/san-pham/:id` | Chi tiết sản phẩm | Ảnh, giá, thêm giỏ |
| `/gio-hang` | Giỏ hàng | Sửa số lượng, xóa |
| `/thanh-toan` | Thanh toán | Form giao hàng + COD/chuyển khoản |
| `/lien-he` | Liên hệ | Form + thông tin cửa hàng + bản đồ |
| `*` | 404 | Link về Trang chủ |

Layout chung: Header (logo, menu: Trang chủ · Danh mục · Liên hệ, icon giỏ + Badge số lượng) / Footer (giới thiệu, liên hệ, giờ mở cửa, mạng xã hội). Breakpoints MUI mặc định (xs 0, sm 600, md 900, lg 1200). Container `maxWidth="lg"`.

## 2. Wireframe (văn bản)

### Trang chủ
**Desktop:** AppBar sticky (logo trái, menu giữa, tìm kiếm + giỏ phải) → Hero 2 cột (trái: tiêu đề "Hoa tươi mỗi ngày – trao trọn yêu thương", mô tả, nút "Mua ngay" + "Xem danh mục"; phải: ảnh bó hoa bo góc 24) → Lưới 4 ô danh mục (Hoa hồng, Hoa sinh nhật, Hoa cưới, Hoa khai trương) → "Bán chạy" lưới 4 cột x 2 hàng ProductCard → Dải 3-4 lợi ích (Giao 2h, Hoa tươi 100%, Miễn phí thiệp, Đổi trả) → Đánh giá khách hàng (3 card) → Footer.
**Mobile:** AppBar: hamburger (Drawer) + logo + giỏ. Hero 1 cột (ảnh trên, chữ, nút full-width). Danh mục lưới 2 cột. Sản phẩm 2 cột. Lợi ích 1 cột/xếp dọc. Đánh giá cuộn ngang. Footer xếp dọc.

### Danh mục
**Desktop:** Breadcrumb → Tiêu đề + số kết quả + Select sắp xếp (Mới nhất, Giá tăng, Giá giảm) → 2 cột: Sidebar lọc 260px trái (loại hoa, khoảng giá Slider, dịp tặng) | lưới sản phẩm 3 cột + Pagination.
**Mobile:** Nút "Bộ lọc" mở Drawer đáy; Select sắp xếp cạnh; lưới 2 cột; Pagination nhỏ. Trạng thái rỗng: minh họa + "Không tìm thấy sản phẩm".

### Chi tiết sản phẩm
**Desktop:** Breadcrumb → 2 cột: trái ảnh lớn + 4 thumbnail; phải tên (h2), giá (màu primary, giá gốc gạch), mô tả ngắn, chọn kích cỡ (ToggleButtonGroup S/M/L), số lượng (− 1 +), nút "Thêm vào giỏ" (contained) + "Mua ngay" (outlined), chính sách giao hàng → Tabs (Mô tả, Chăm sóc hoa, Đánh giá) → "Sản phẩm liên quan" 4 cột.
**Mobile:** ảnh swipe full-width → tên, giá → chọn size, SL → mô tả (Accordion) → liên quan cuộn ngang. Thanh sticky đáy: giá + nút "Thêm vào giỏ".

### Giỏ hàng
**Desktop:** Tiêu đề "Giỏ hàng (n)" → 2 cột: trái (8/12) bảng dòng: ảnh, tên + size, đơn giá, số lượng, thành tiền, nút xóa | phải (4/12) card Tóm tắt (tạm tính, phí ship, tổng, mã giảm giá, nút "Thanh toán", link "Tiếp tục mua").
**Mobile:** mỗi dòng là card (ảnh trái, thông tin phải, stepper + xóa); Tóm tắt xếp dưới + thanh sticky đáy tổng tiền + "Thanh toán". Giỏ trống: minh họa + nút "Mua sắm ngay".

### Thanh toán
**Desktop:** Stepper 2 bước nhỏ (Thông tin → Xác nhận) → 2 cột: trái form (Họ tên, SĐT, Email, Tỉnh/Thành, Quận/Huyện, Địa chỉ, Ngày & giờ giao, Lời nhắn thiệp, Radio thanh toán: COD / Chuyển khoản) | phải card tóm tắt đơn (danh sách mini, tổng) + nút "Đặt hàng".
**Mobile:** 1 cột: tóm tắt đơn (Accordion thu gọn) trên → form → nút "Đặt hàng" full-width sticky. Validation inline tiếng Việt (SĐT 10 số). Thành công: màn "Đặt hàng thành công" kèm mã đơn.

### Liên hệ
**Desktop:** Tiêu đề + mô tả → 2 cột: trái form (Họ tên, Email, SĐT, Nội dung, "Gửi liên hệ") | phải card thông tin (địa chỉ, hotline, email, giờ mở cửa 7:00–21:00, icon mạng xã hội) → bản đồ nhúng full-width.
**Mobile:** thông tin → form → bản đồ cao 240px.

## 3. Design tokens

### Màu
| Token | Hex | Dùng cho |
|---|---|---|
| primary.main | `#E85D8A` | Hồng hoa – nút chính, link, giá |
| primary.light | `#F58FB0` | Hover nhẹ |
| primary.dark | `#C23F6C` | Hover/active (đạt tương phản chữ trắng ≥4.5) |
| secondary.main | `#4F9D69` | Xanh lá – nhãn, thành công, nút phụ |
| secondary.light | `#8CC9A0` | |
| secondary.dark | `#2F7A4A` | |
| accent (custom) | `#FFC857` | Nắng vàng – sao đánh giá, nhãn "Mới/Giảm giá" |
| background.default | `#FFF8F5` | Nền trang (kem hồng) |
| background.paper | `#FFFFFF` | Card |
| blush (custom) | `#FDE7EE` | Nền section nhấn, chip |
| text.primary | `#3A2A30` | |
| text.secondary | `#7A6168` | |
| divider | `#F0DDE3` | |
| error | `#D32F2F` · warning `#ED9B1F` · info `#3B82C4` · success `#2F7A4A` | |

Lưu ý: nút primary chữ trắng trên `#E85D8A` ~3.6:1 – dùng chữ `700` ≥ 16px hoặc đặt `main` = `#D6457A` nếu cần AA; theme dưới dùng `#D6457A` cho an toàn ở nút (xem code, `contrastText` trắng).

### Chữ
- Tiêu đề: **Playfair Display** (700) — hỗ trợ tiếng Việt; thân/UI: **Be Vietnam Pro** (400/500/600/700). Cả hai ở Google Fonts, subset `vietnamese`.
- Cỡ (desktop → mobile): h1 48→32, h2 36→26, h3 28→22, h4 22→20, h5 18→17, h6 16, body1 16/1.6, body2 14/1.5, button 15 (600, không in hoa), caption 12.

### Bo góc / khoảng cách / bóng
- Radius: nút 999 (pill), card 16, ảnh/Hero 24, input 12, chip 999.
- Spacing base 8px: khoảng cách section 64 (mobile 40); gutter lưới 24 (mobile 16); padding card 16–24; padding ngang trang 16 (mobile) / 24.
- Bóng card: `0 4px 16px rgba(214,69,122,.08)`, hover `0 8px 24px rgba(214,69,122,.16)`, hover nâng `translateY(-2px)`.
- Touch target ≥ 44px; focus ring 2px `#4F9D69`.

## 4. Theme MUI (`src/theme.js`)
```js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const heading = '"Playfair Display", Georgia, serif';
const body = '"Be Vietnam Pro", "Roboto", sans-serif';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#D6457A', light: '#F58FB0', dark: '#B03262', contrastText: '#FFFFFF' },
    secondary: { main: '#4F9D69', light: '#8CC9A0', dark: '#2F7A4A', contrastText: '#FFFFFF' },
    accent: { main: '#FFC857', contrastText: '#3A2A30' },
    blush: { main: '#FDE7EE' },
    error: { main: '#D32F2F' },
    warning: { main: '#ED9B1F' },
    info: { main: '#3B82C4' },
    success: { main: '#2F7A4A' },
    background: { default: '#FFF8F5', paper: '#FFFFFF' },
    text: { primary: '#3A2A30', secondary: '#7A6168' },
    divider: '#F0DDE3',
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  typography: {
    fontFamily: body,
    h1: { fontFamily: heading, fontWeight: 700, fontSize: '3rem', lineHeight: 1.2 },
    h2: { fontFamily: heading, fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.25 },
    h3: { fontFamily: heading, fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3 },
    h4: { fontFamily: heading, fontWeight: 600, fontSize: '1.375rem' },
    h5: { fontWeight: 600, fontSize: '1.125rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.9375rem' },
    caption: { fontSize: '0.75rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#FFF8F5' } },
    },
    MuiContainer: { defaultProps: { maxWidth: 'lg' } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, padding: '10px 24px', minHeight: 44 },
        containedPrimary: { '&:hover': { backgroundColor: '#B03262' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(214,69,122,.08)',
          transition: 'box-shadow .2s, transform .2s',
          '&:hover': { boxShadow: '0 8px 24px rgba(214,69,122,.16)', transform: 'translateY(-2px)' },
        },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, backgroundColor: '#FFFFFF' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 500 } } },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: { root: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0DDE3' } },
    },
    MuiLink: { defaultProps: { underline: 'hover' } },
  },
});

theme = responsiveFontSizes(theme, { factor: 2.5 }); // h1 48→~32 trên mobile
export default theme;
```
Dùng: `<ThemeProvider theme={theme}><CssBaseline/>…`. Nạp font trong `index.html`:
`https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@600;700&subset=vietnamese&display=swap`
Màu `accent`/`blush` là palette tùy biến: dùng `sx={{ bgcolor: 'blush.main' }}`; nếu dùng `color="accent"` cần khai báo module augmentation (TS) hoặc chỉ dùng qua `sx`.

## 5. Component chính cho frontend-dev
Header, Footer, ProductCard (ảnh tỉ lệ 4:5, tên, giá, nút thêm giỏ, nhãn), CategoryTile, FilterPanel/Drawer, QuantityStepper, CartItemRow, OrderSummary, CheckoutForm, ContactForm. Định dạng tiền: `Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'})`. Tất cả chuỗi UI tiếng Việt, ảnh có `alt`, giỏ hàng lưu `localStorage`.
