import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Forbidden from './pages/Forbidden';

// Storefront & Auth pages
const Category = lazy(() => import('./pages/Category'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Contact = lazy(() => import('./pages/Contact'));
const CustomerLogin = lazy(() => import('./pages/CustomerLogin'));
const CustomerRegister = lazy(() => import('./pages/CustomerRegister'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Customer Account pages
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const AccountProfile = lazy(() => import('./pages/account/AccountProfile'));
const AccountOrders = lazy(() => import('./pages/account/AccountOrders'));
const AccountPassword = lazy(() => import('./pages/account/AccountPassword'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function StoreLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense
        fallback={
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
            <CircularProgress color="primary" />
          </Box>
        }
      >
        <Routes>
          {/* Admin Login (giao diện riêng biệt cho quản trị) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes (chỉ dành cho admin/staff) */}
          <Route element={<ProtectedRoute requireRole={['admin', 'staff']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<ProtectedRoute requiredPermissions={['categories.manage']}><AdminCategories /></ProtectedRoute>} />
              <Route path="products" element={<ProtectedRoute requiredPermissions={['products.manage']}><AdminProducts /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute requiredPermissions={['orders.read']}><AdminOrders /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute requiredPermissions={['users.manage']}><AdminUsers /></ProtectedRoute>} />
            </Route>
          </Route>

          {/* Storefront & Customer routes (layout chung có Header và Footer) */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/danh-muc" element={<Category />} />
            <Route path="/san-pham/:id" element={<ProductDetail />} />
            <Route path="/gio-hang" element={<Cart />} />
            <Route path="/thanh-toan" element={<Checkout />} />
            <Route path="/lien-he" element={<Contact />} />
            <Route path="/dang-nhap" element={<CustomerLogin />} />
            <Route path="/dang-ky" element={<CustomerRegister />} />
            <Route path="/403" element={<Forbidden />} />

            {/* Customer Account (yêu cầu đăng nhập) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/tai-khoan" element={<AccountLayout />}>
                <Route index element={<AccountProfile />} />
                <Route path="don-hang" element={<AccountOrders />} />
                <Route path="doi-mat-khau" element={<AccountPassword />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
