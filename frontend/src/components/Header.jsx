import { useState } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/danh-muc', label: 'Danh mục' },
  { to: '/lien-he', label: 'Liên hệ' },
];

function Logo() {
  return (
    <Box
      component={RouterLink}
      to="/"
      aria-label="SunnyFlower – Trang chủ"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        color: 'primary.main',
        textDecoration: 'none',
      }}
    >
      <LocalFloristIcon />
      <Typography variant="h4" component="span" sx={{ fontWeight: 700 }}>
        SunnyFlower
      </Typography>
    </Box>
  );
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const { count } = useCart();
  const { isAuthenticated, isStaff, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/dang-nhap');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) navigate(`/danh-muc?q=${encodeURIComponent(q)}`);
  };

  return (
    <AppBar position="sticky">
      <Container>
        <Toolbar disableGutters sx={{ gap: 2, minHeight: { xs: 56, md: 72 } }}>
          <IconButton
            aria-label="Mở menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Logo />

          <Box
            component="nav"
            aria-label="Menu chính"
            sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mx: 'auto' }}
          >
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.end}
                color="inherit"
                sx={{ '&.active': { color: 'primary.main', bgcolor: 'blush.main' } }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flex: { xs: 1, md: 0 } }} />

          <Box
            component="form"
            role="search"
            onSubmit={handleSearch}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              bgcolor: 'blush.main',
              borderRadius: 999,
              px: 2,
              minHeight: 44,
            }}
          >
            <InputBase
              placeholder="Tìm hoa…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              inputProps={{ 'aria-label': 'Tìm kiếm sản phẩm' }}
              sx={{ width: 150 }}
            />
            <IconButton type="submit" size="small" aria-label="Tìm kiếm">
              <SearchIcon />
            </IconButton>
          </Box>

          <IconButton
            component={RouterLink}
            to="/gio-hang"
            aria-label={`Giỏ hàng, ${count} sản phẩm`}
          >
            <Badge badgeContent={count} color="primary" max={99}>
              <ShoppingBagOutlinedIcon />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <>
              <Tooltip title={user?.fullName || 'Tài khoản'}>
                <IconButton onClick={openMenu} sx={{ p: 0.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 36,
                      height: 36,
                      fontSize: '0.9rem',
                    }}
                  >
                    {user?.fullName?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={closeMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    minWidth: 200,
                    mt: 1,
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                    {user?.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem component={RouterLink} to="/tai-khoan" onClick={closeMenu}>
                  <ListItemIcon>
                    <PersonOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  Tài khoản của tôi
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to="/tai-khoan/don-hang"
                  onClick={closeMenu}
                >
                  <ListItemIcon>
                    <ReceiptLongIcon fontSize="small" />
                  </ListItemIcon>
                  Đơn hàng của tôi
                </MenuItem>
                {(isAdmin || isStaff) && (
                  <MenuItem
                    component={RouterLink}
                    to="/admin"
                    onClick={closeMenu}
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    <ListItemIcon>
                      <AdminPanelSettingsIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    Trang Quản Trị
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/dang-nhap"
              variant="outlined"
              size="small"
              startIcon={<LoginIcon />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, borderColor: 'divider' }}
            >
              Đăng nhập
            </Button>
          )}

          {(isStaff || isAdmin) && (
            <Tooltip title="Trang Quản trị Admin">
              <IconButton
                component={RouterLink}
                to="/admin"
                aria-label="Trang Quản trị Admin"
                color="primary"
                sx={{ bgcolor: 'blush.main' }}
              >
                <AdminPanelSettingsIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ p: 2 }}>
          <Logo />
        </Box>

        <Box
          component="form"
          role="search"
          onSubmit={(e) => {
            handleSearch(e);
            setDrawerOpen(false);
          }}
          sx={{ px: 2, pb: 1 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'blush.main',
              borderRadius: 999,
              px: 2,
            }}
          >
            <InputBase
              placeholder="Tìm hoa…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              inputProps={{ 'aria-label': 'Tìm kiếm sản phẩm' }}
              sx={{ flex: 1 }}
            />
            <IconButton type="submit" size="small" aria-label="Tìm kiếm">
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        <List component="nav" aria-label="Menu di động">
          {NAV_ITEMS.map((item) => (
            <ListItem
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.end}
              onClick={() => setDrawerOpen(false)}
              sx={{
                minHeight: 48,
                '&.active': { color: 'primary.main', bgcolor: 'blush.main' },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}

          <Divider sx={{ my: 1 }} />

          {isAuthenticated ? (
            <>
              <ListItem
                component={RouterLink}
                to="/tai-khoan"
                onClick={() => setDrawerOpen(false)}
                sx={{ minHeight: 48 }}
              >
                <ListItemIcon>
                  <PersonOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Tài khoản của tôi"
                  secondary={user?.fullName}
                />
              </ListItem>
              <ListItem
                component={RouterLink}
                to="/tai-khoan/don-hang"
                onClick={() => setDrawerOpen(false)}
                sx={{ minHeight: 48 }}
              >
                <ListItemIcon>
                  <ReceiptLongIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Đơn hàng của tôi" />
              </ListItem>
              {(isStaff || isAdmin) && (
                <ListItem
                  component={RouterLink}
                  to="/admin"
                  onClick={() => setDrawerOpen(false)}
                  sx={{ minHeight: 48, color: 'primary.main' }}
                >
                  <ListItemIcon>
                    <AdminPanelSettingsIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Trang Quản trị Admin" />
                </ListItem>
              )}
              <ListItem
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
                sx={{ minHeight: 48, color: 'error.main' }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Đăng xuất" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem
                component={RouterLink}
                to="/dang-nhap"
                onClick={() => setDrawerOpen(false)}
                sx={{ minHeight: 48 }}
              >
                <ListItemIcon>
                  <LoginIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Đăng nhập" />
              </ListItem>
              <ListItem
                component={RouterLink}
                to="/dang-ky"
                onClick={() => setDrawerOpen(false)}
                sx={{ minHeight: 48 }}
              >
                <ListItemIcon>
                  <PersonOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Đăng ký tài khoản" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
}
