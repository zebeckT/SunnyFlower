import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || '/tai-khoan';

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin' || user?.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      if (result.user?.role === 'admin' || result.user?.role === 'staff') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error || 'Email hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 6, md: 10 } }}>
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
          <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52, mb: 2 }}>
            <LockOutlinedIcon fontSize="medium" />
          </Avatar>

          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}
          >
            Đăng Nhập
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: 'center' }}
          >
            Chào mừng bạn quay lại với SunnyFlower
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              label="Địa chỉ Email"
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
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              sx={{ mb: 3 }}
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

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.3, fontWeight: 700, fontSize: '1rem', mb: 2.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Nhập'}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Chưa có tài khoản thành viên?{' '}
            <Link
              component={RouterLink}
              to="/dang-ky"
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
