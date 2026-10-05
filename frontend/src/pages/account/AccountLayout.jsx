import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { Crumbs } from '../../components/PageBits';

export default function AccountLayout() {
  const { user, logout, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/dang-nhap');
  };

  const menuItems = [
    { to: '/tai-khoan', label: 'Hồ sơ cá nhân', icon: <PersonIcon />, end: true },
    { to: '/tai-khoan/don-hang', label: 'Đơn hàng của tôi', icon: <ShoppingBagOutlinedIcon /> },
    { to: '/tai-khoan/doi-mat-khau', label: 'Đổi mật khẩu', icon: <LockResetIcon /> },
  ];

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Crumbs items={[{ label: 'Tài khoản của tôi', to: '/tai-khoan' }]} />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid #F0DDE3' }}>
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'blush.main' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 1.5,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user?.fullName || 'Khách hàng'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user?.email}
              </Typography>
              <Chip
                label={isAdmin ? 'Quản trị viên' : isStaff ? 'Nhân viên' : 'Thành viên'}
                color={isAdmin ? 'primary' : isStaff ? 'secondary' : 'default'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider />

            <List sx={{ p: 1.5 }}>
              {menuItems.map((item) => (
                <ListItem
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  end={item.end}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.active': {
                      bgcolor: 'primary.main',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                    },
                    '&:hover:not(.active)': { bgcolor: 'blush.main' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                  />
                </ListItem>
              ))}

              {(isAdmin || isStaff) && (
                <ListItem
                  onClick={() => navigate('/admin')}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'blush.main' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Vào Trang Quản Trị"
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItem>
              )}

              <Divider sx={{ my: 1 }} />

              <ListItem
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  color: 'error.main',
                  '&:hover': { bgcolor: '#FDECEC' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Đăng Xuất"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            </List>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3, border: '1px solid #F0DDE3' }}>
            <Outlet />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
