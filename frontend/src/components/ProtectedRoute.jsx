import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Forbidden from '../pages/Forbidden';

export default function ProtectedRoute({ requireRole, requiredPermissions, children }) {
  const { isAuthenticated, user, hasPermission } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (!isAuthenticated) {
    return (
      <Navigate
        to={isAdminRoute ? '/admin/login' : '/dang-nhap'}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requireRole && !(Array.isArray(requireRole) ? requireRole : [requireRole]).includes(user?.role)) {
    return <Forbidden />;
  }

  if (requiredPermissions && requiredPermissions.length > 0 && !requiredPermissions.every((p) => hasPermission(p))) {
    return <Forbidden />;
  }

  return children ?? <Outlet />;
}
