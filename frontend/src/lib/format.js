const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

export const formatVND = (n) => vndFormatter.format(n || 0);

const FREE_SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;

export const shippingFor = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

export const PHONE_RE = /^(0|\+84)\d{9}$/;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const stripAccents = (str) =>
  str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
