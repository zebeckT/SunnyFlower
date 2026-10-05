import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useAuth } from '../context/AuthContext';
import { EMAIL_RE } from '../lib/format';

export default function CustomerRegister() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tai-khoan', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = fullName.trim();
    const emailVal = email.trim();

    if (!name || name.length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }
    if (!emailVal || !EMAIL_RE.test(emailVal)) {
      setError('Địa chỉ email không hợp lệ.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Mật khẩu phải có độ dài tối thiểu 8 ký tự.');
      return;
    }
    if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      setError('Mật khẩu phải bao gồm cả chữ và số để đảm bảo an toàn.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    const result = await register(name, emailVal, password);
    if (result.success) {
      navigate('/tai-khoan', { replace: true });
    } else {
      setError(result.error || 'Đăng ký không thành công. Email này có thể đã được sử dụng.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 5, md: 8 } }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(214, 69, 122, 0.12)',
          border: '1px solid #F0DDE3',
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ bgcolor: 'secondary.main', width: 52, height: 52, mb: 2 }}>
            <PersonAddOutlinedIcon fontSize="medium" />
          </Avatar>

          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}
          >
            Đăng Ký Thành Viên
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: 'center' }}
          >
            Tạo tài khoản để theo dõi đơn hoa và nhận ưu đãi độc quyền
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              label="Họ và tên của bạn *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              fullWidth
              autoComplete="name"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Địa chỉ Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Mật khẩu (tối thiểu 8 ký tự, có chữ và số) *"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Xác nhận lại mật khẩu *"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.3, fontWeight: 700, fontSize: '1rem', mb: 2.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Tạo Tài Khoản'}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Đã có tài khoản SunnyFlower?{' '}
            <Link
              component={RouterLink}
              to="/dang-nhap"
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Đăng nhập tại đây
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
