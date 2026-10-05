import { useState } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { to: '/admin', label: 'Bảng tổng quan', icon: <DashboardIcon />, end: true },
  { to: '/admin/categories', label: 'Quản lý Danh mục', icon: <CategoryIcon />, permission: 'categories.manage' },
  { to: '/admin/products', label: 'Quản lý Sản phẩm', icon: <LocalFloristIcon />, permission: 'products.manage' },
  { to: '/admin/orders', label: 'Quản lý Đơn hàng', icon: <ShoppingBagIcon />, permission: 'orders.read' },
  { to: '/admin/users', label: 'Quản lý Người dùng', icon: <PeopleAltIcon />, permission: 'users.manage' },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission));

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getPageTitle = () => {
    const match = NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    return match ? match.label : 'Quản trị hệ thống';
  };

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <LocalFloristIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
            SunnyFlower
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            ADMIN PORTAL
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'divider' }} />

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'blush.main',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '0.9rem' }}>
            {user?.fullName?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, noWrap: true }}>
              {user?.fullName || 'Admin'}
            </Typography>
            <Chip
              label={user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              size="small"
              color={user?.role === 'admin' ? 'primary' : 'secondary'}
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 1.5, flex: 1 }}>
        {filteredItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.2,
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
              primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'divider' }} />

      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<StorefrontIcon />}
          onClick={() => navigate('/')}
          sx={{ justifyContent: 'flex-start', color: 'text.primary', borderColor: 'divider' }}
        >
          Về Cửa Hàng
        </Button>
        <Button
          fullWidth
          color="error"
          variant="soft"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ justifyContent: 'flex-start', bgcolor: '#FDECEC', color: 'error.main' }}
        >
          Đăng Xuất
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9F6F7' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, bgcolor: '#FFFFFF' },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid #F0DDE3',
            bgcolor: '#FFFFFF',
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #F0DDE3',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {getPageTitle()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Xem trang bán hoa SunnyFlower">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<StorefrontIcon />}
                  onClick={() => window.open('/', '_blank')}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, borderColor: 'divider' }}
                >
                  Xem Shop
                </Button>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 34, height: 34, fontSize: '0.85rem' }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
