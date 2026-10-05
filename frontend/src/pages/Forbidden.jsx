import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth } from '../context/AuthContext';

export default function Forbidden() {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
      <Box
        sx={{
          display: 'inline-flex',
          p: 3,
          borderRadius: '50%',
          bgcolor: '#FDECEC',
          color: 'error.main',
          mb: 3,
        }}
      >
        <LockPersonIcon sx={{ fontSize: 64 }} />
      </Box>

      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        403 — Không có quyền truy cập
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Tài khoản <strong>{user?.email}</strong> (Vai trò: <em>{user?.role}</em>) không có quyền
        truy cập vào chức năng hoặc trang này.
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Nếu bạn là nhân viên hoặc quản trị viên, vui lòng liên hệ cấp trên để được cấp thêm quyền
        hạn.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          startIcon={<StorefrontIcon />}
        >
          Về trang chủ
        </Button>
        <Button variant="outlined" color="error" onClick={logout}>
          Đăng xuất tài khoản
        </Button>
      </Box>
    </Container>
  );
}
