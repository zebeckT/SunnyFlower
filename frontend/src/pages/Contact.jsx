import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { createContact } from '../lib/api';
import { PHONE_RE, EMAIL_RE } from '../lib/format';
import { STORE_INFO } from '../components/Footer';

const INITIAL = { name: '', email: '', phone: '', message: '' };

function InfoRow({ icon, children }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
      <Box sx={{ color: 'primary.main', display: 'flex', pt: 0.25 }}>{icon}</Box>
      <Typography>{children}</Typography>
    </Box>
  );
}

export default function Contact() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!EMAIL_RE.test(form.email)) {
      errs.email = 'Email không hợp lệ';
    }
    if (form.phone && !PHONE_RE.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }
    if (!form.message.trim()) {
      errs.message = 'Vui lòng nhập nội dung liên hệ';
    } else if (form.message.trim().length < 10) {
      errs.message = 'Nội dung liên hệ phải có ít nhất 10 ký tự';
    }

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await createContact({
        fullName: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone ? form.phone.replace(/\s/g, '') : null,
        content: form.message.trim(),
      });
      setSuccess(true);
      setForm(INITIAL);
    } catch (err) {
      setServerError(
        err.message || 'Không thể gửi tin nhắn liên hệ lúc này. Vui lòng thử lại sau.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = (field, label, extra = {}) => ({
    label,
    value: form[field],
    onChange: handleChange(field),
    error: !!errors[field],
    helperText: errors[field],
    disabled: submitting,
    ...extra,
  });

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Liên hệ
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Cần tư vấn chọn hoa hoặc đặt số lượng lớn? Hãy để lại lời nhắn, SunnyFlower sẽ phản hồi
        sớm nhất.
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }} sx={{ order: { xs: 2, md: 1 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Cảm ơn bạn! Chúng tôi đã nhận được lời nhắn và sẽ liên hệ trong thời gian sớm
                nhất.
              </Alert>
            )}
            {serverError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {serverError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField {...fieldProps('name', 'Họ và tên *', { autoComplete: 'name' })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...fieldProps('email', 'Email *', { type: 'email', autoComplete: 'email' })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...fieldProps('phone', 'Số điện thoại', { type: 'tel', autoComplete: 'tel' })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...fieldProps('message', 'Nội dung (tối thiểu 10 ký tự) *', {
                    multiline: true,
                    minRows: 5,
                  })}
                />
              </Grid>
              <Grid size={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{ minWidth: 160 }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : 'Gửi liên hệ'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Card sx={{ '&:hover': { transform: 'none' } }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Thông tin cửa hàng
              </Typography>
              <InfoRow icon={<PlaceOutlinedIcon />}>{STORE_INFO.address}</InfoRow>
              <InfoRow icon={<PhoneOutlinedIcon />}>{STORE_INFO.phone}</InfoRow>
              <InfoRow icon={<MailOutlinedIcon />}>{STORE_INFO.email}</InfoRow>
              <InfoRow icon={<AccessTimeIcon />}>{STORE_INFO.hours}</InfoRow>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        component="iframe"
        title="Bản đồ cửa hàng SunnyFlower"
        src="https://www.openstreetmap.org/export/embed.html?bbox=106.697%2C10.771%2C106.708%2C10.779&layer=mapnik"
        loading="lazy"
        sx={{
          mt: 4,
          width: '100%',
          height: { xs: 240, md: 360 },
          border: 0,
          borderRadius: '24px',
        }}
      />
    </Container>
  );
}
