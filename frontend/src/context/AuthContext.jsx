import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isTokenExpired } from '../lib/authHelpers';

const AuthContext = createContext(null);
const AUTH_KEY = 'sunnyflower_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (isTokenExpired(parsed)) {
        localStorage.removeItem(AUTH_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  useEffect(() => {
    if (auth) {
      if (isTokenExpired(auth)) {
        logout();
      } else {
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      }
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [auth, logout]);

  useEffect(() => {
    if (!auth?.expiresAt) return;
    const remaining = new Date(auth.expiresAt).getTime() - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    const timer = setTimeout(() => {
      logout();
    }, remaining);
    return () => clearTimeout(timer);
  }, [auth, logout]);

  useEffect(() => {
    const handler = () => {
      logout();
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [logout]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Đăng nhập thất bại');
      setAuth({ token: data.token, expiresAt: data.expiresAt, user: data.user });
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Đăng ký không thành công');
      setAuth({ token: data.token, expiresAt: data.expiresAt, user: data.user });
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (fullName) => {
    if (!auth?.token) return { success: false, error: 'Chưa đăng nhập' };
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ fullName }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Cập nhật thất bại');
      setAuth((prev) =>
        prev ? { ...prev, user: { ...prev.user, fullName: data.fullName } } : null,
      );
      return { success: true, user: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!auth?.token) return { success: false, error: 'Chưa đăng nhập' };
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Đổi mật khẩu thất bại');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const hasPermission = (perm) => {
    if (!auth?.token || isTokenExpired(auth) || !auth?.user) return false;
    return auth.user.role === 'admin' || (auth.user.permissions || []).includes(perm);
  };

  const isAuthenticated = !!(auth?.token && !isTokenExpired(auth));

  const value = {
    auth,
    token: isAuthenticated ? auth?.token : null,
    user: isAuthenticated ? auth?.user : null,
    isAuthenticated,
    isAdmin: isAuthenticated && auth?.user?.role === 'admin',
    isStaff: isAuthenticated && (auth?.user?.role === 'admin' || auth?.user?.role === 'staff'),
    isCustomer: isAuthenticated && auth?.user?.role === 'customer',
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error('useAuth must be used within an AuthProvider');
  return context;
}
