import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useCart } from '../context/CartContext';
import { createOrder } from '../lib/api';
import { formatVND, PHONE_RE, EMAIL_RE } from '../lib/format';
import { Crumbs, EmptyState } from '../components/PageBits';
import OrderSummary from '../components/OrderSummary';

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const DELIVERY_TIME_SLOTS = [
  'Giao nhanh (trong vòng 2 giờ)',
  '08:00 - 12:00 (Buổi sáng)',
  '13:00 - 17:00 (Buổi chiều)',
  '17:00 - 20:00 (Buổi tối)',
];

const INITIAL = {
  fullName: '',
  phone: '',
  email: '',
  city: 'TP. Hồ Chí Minh',
  district: '',
  ward: '',
  address: '',
  deliveryDate: getToday(),
  deliveryTime: 'Giao nhanh (trong vòng 2 giờ)',
  cardMessage: '',
  note: '',
};

function validate(form) {
  const errs = {};
  if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên';
  if (!form.phone.trim()) {
    errs.phone = 'Vui lòng nhập số điện thoại';
  } else if (!PHONE_RE.test(form.phone.replace(/\s/g, ''))) {
    errs.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
  }
  if (form.email && !EMAIL_RE.test(form.email)) errs.email = 'Email không hợp lệ';
  if (!form.city.trim()) errs.city = 'Vui lòng nhập Tỉnh/Thành';
  if (!form.district.trim()) errs.district = 'Vui lòng nhập Quận/Huyện';
  if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ';
  if (form.deliveryDate && form.deliveryDate < getToday())
    errs.deliveryDate = 'Ngày giao không được ở quá khứ';
  if (!form.deliveryTime) errs.deliveryTime = 'Vui lòng chọn khung giờ giao hàng';
  if (form.cardMessage.length > 200) errs.cardMessage = 'Lời nhắn tối đa 200 ký tự';
  return errs;
}

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [form, setForm] = useState(INITIAL);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [order, setOrder] = useState(null);

  if (order) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 }, textAlign: 'center' }}>
        <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 80 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Đặt hàng thành công!
        </Typography>
        <Typography sx={{ mb: 1 }}>
          Mã đơn hàng của bạn: <strong>{order.id}</strong>
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Khung giờ giao hàng: <strong>{form.deliveryTime}</strong> (Ngày:{' '}
          {form.deliveryDate || getToday()})
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Chúng tôi sẽ liên hệ xác nhận qua số {order.shipping?.phone || form.phone}. Tổng thanh
          toán: {formatVND(order.total || total)}
          {order.paymentMethod === 'bank_transfer'
            ? ' (chuyển khoản – nội dung: mã đơn hàng).'
            : ' (thanh toán khi nhận hàng).'}
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Về trang chủ
        </Button>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container sx={{ py: 6 }}>
        <EmptyState
          title="Giỏ hàng trống"
          text="Hãy thêm sản phẩm trước khi thanh toán."
          actionLabel="Mua sắm ngay"
          to="/danh-muc"
        />
      </Container>
    );
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const fieldProps = (field, label, extra = {}) => ({
    id: `co-${field}`,
    label,
    value: form[field],
    onChange: handleChange(field),
    error: !!errors[field],
    helperText: errors[field] || extra.helper,
    ...extra,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setServerError('');

    if (Object.keys(errs).length) {
      document.getElementById(`co-${Object.keys(errs)[0]}`)?.focus();
      return;
    }

    setSubmitting(true);
    const strip = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''));

    try {
      const payload = {
        items: items.reduce((acc, item) => {
          const existing = acc.find((i) => i.productId === item.productId);
          if (existing) {
            existing.quantity = Math.min(20, existing.quantity + item.quantity);
          } else {
            acc.push({ productId: item.productId, quantity: item.quantity });
          }
          return acc;
        }, []),
        paymentMethod,
        shipping: strip({
          fullName: form.fullName.trim(),
          phone: form.phone.replace(/\s/g, ''),
          email: form.email.trim(),
          address: form.address.trim(),
          ward: form.ward.trim(),
          district: form.district.trim(),
          city: form.city.trim(),
          deliveryDate: form.deliveryDate || null,
          cardMessage: form.cardMessage
            ? `${form.cardMessage} (Giờ giao: ${form.deliveryTime})`
            : `Giờ giao: ${form.deliveryTime}`,
        }),
        note: form.note
          ? `${form.note} [Khung giờ giao: ${form.deliveryTime}]`
          : `[Khung giờ giao: ${form.deliveryTime}]`,
      };

      const result = await createOrder(payload);
      clear();
      setOrder(result);
    } catch (err) {
      setServerError(err.message || 'Không thể tạo đơn hàng lúc này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Crumbs items={[{ label: 'Giỏ hàng', to: '/gio-hang' }, { label: 'Thanh toán' }]} />
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3 }}>
        Đặt hàng & Thanh toán
      </Typography>

      <Box component="form" id="checkout-form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Thông tin giao hàng
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField {...fieldProps('fullName', 'Họ và tên *')} autoComplete="name" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField {...fieldProps('phone', 'Số điện thoại *')} type="tel" autoComplete="tel" />
              </Grid>
              <Grid size={12}>
                <TextField {...fieldProps('email', 'Email')} type="email" autoComplete="email" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField {...fieldProps('city', 'Tỉnh/Thành *')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField {...fieldProps('district', 'Quận/Huyện *')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField {...fieldProps('ward', 'Phường/Xã')} />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...fieldProps('address', 'Địa chỉ (số nhà, tên đường) *')}
                  autoComplete="street-address"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...fieldProps('deliveryDate', 'Ngày giao hoa *')}
                  type="date"
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: getToday() },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  {...fieldProps('deliveryTime', 'Khung giờ giao hàng *')}
                >
                  {DELIVERY_TIME_SLOTS.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  {...fieldProps('cardMessage', 'Lời nhắn thiệp tặng kèm', {
                    helper: `${form.cardMessage.length}/200`,
                  })}
                  multiline
                  minRows={2}
                  slotProps={{ htmlInput: { maxLength: 200 } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...fieldProps('note', 'Ghi chú cho shipper hoặc cửa hàng')}
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>

            <FormControl sx={{ mt: 3 }}>
              <FormLabel id="pay-label" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Phương thức thanh toán
              </FormLabel>
              <RadioGroup
                aria-labelledby="pay-label"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="cod"
                  control={<Radio />}
                  label="Thanh toán khi nhận hàng (COD)"
                />
                <FormControlLabel
                  value="bank_transfer"
                  control={<Radio />}
                  label="Chuyển khoản ngân hàng"
                />
              </RadioGroup>
            </FormControl>

            {paymentMethod === 'bank_transfer' && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Thông tin chuyển khoản sẽ được gửi qua điện thoại/email sau khi đặt hàng.
              </Alert>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 5 }} sx={{ order: { xs: -1, md: 0 } }}>
            <OrderSummary showItems>
              {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {serverError}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : 'Đặt hàng'}
              </Button>
            </OrderSummary>
          </Grid>
        </Grid>

        <Paper
          elevation={8}
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1100,
            p: 1.5,
            gap: 2,
            alignItems: 'center',
            borderRadius: 0,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Tổng cộng
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
              {formatVND(total)}
            </Typography>
          </Box>
          <Button
            type="submit"
            form="checkout-form"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Đặt hàng'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
