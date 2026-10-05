import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading, isAuthenticated, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated && (isStaff || isAdmin)) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isStaff, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      const role = result.user?.role;
      if (role === 'admin' || role === 'staff') {
        navigate(from.startsWith('/admin') ? from : '/admin', { replace: true });
      } else {
        setErrorMsg(
          'Tài khoản này là tài khoản Khách hàng (Customer), không có quyền quản trị. Đang chuyển tới khu vực tài khoản...'
        );
        setTimeout(() => {
          navigate('/tai-khoan', { replace: true });
        }, 1200);
      }
    } else {
      setErrorMsg(result.error || 'Email hoặc mật khẩu không chính xác');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FDE7EE 50%, #F5F7FA 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          boxShadow: '0 12px 40px rgba(214, 69, 122, 0.15)',
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
              mb: 2,
              boxShadow: '0 4px 14px rgba(214, 69, 122, 0.35)',
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            SunnyFlower Admin
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
            Đăng nhập hệ thống quản lý cửa hàng hoa tươi
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              label="Email quản trị"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
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
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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
              sx={{ py: 1.4, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Nhập Quản Trị'}
            </Button>
          </Box>

          <Divider sx={{ width: '100%', my: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              TÀI KHOẢN MẪU
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            startIcon={<VpnKeyIcon />}
            onClick={() => {
              setEmail('admin@sunnyflower.vn');
              setPassword('Admin@123');
              setErrorMsg('');
            }}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Điền nhanh tài khoản Admin mẫu
          </Button>

          <Button
            component={RouterLink}
            to="/"
            variant="text"
            startIcon={<StorefrontIcon />}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Quay lại Cửa Hàng SunnyFlower
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
