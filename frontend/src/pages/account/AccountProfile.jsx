import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../context/AuthContext';

export default function AccountProfile() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ text: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setAlert({ text: 'Họ và tên phải có ít nhất 2 ký tự.', severity: 'error' });
      return;
    }
    setSaving(true);
    setAlert({ text: '', severity: 'success' });
    const result = await updateProfile(fullName.trim());
    setSaving(false);
    if (result.success) {
      setAlert({ text: 'Cập nhật thông tin thành công!', severity: 'success' });
    } else {
      setAlert({ text: result.error || 'Cập nhật thất bại.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Hồ Sơ Cá Nhân
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Xem và cập nhật thông tin tài khoản của bạn tại SunnyFlower
      </Typography>

      {alert.text && (
        <Alert severity={alert.severity} sx={{ mb: 3, borderRadius: 2 }}>
          {alert.text}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Địa chỉ Email"
          value={user?.email || ''}
          disabled
          fullWidth
          helperText="Email tài khoản không thể thay đổi"
          sx={{ mb: 2.5 }}
        />

        <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Vai trò hệ thống:
          </Typography>
          <Chip
            label={
              user?.role === 'admin'
                ? 'Quản trị viên'
                : user?.role === 'staff'
                  ? 'Nhân viên'
                  : 'Khách hàng thành viên'
            }
            color={user?.role === 'admin' ? 'primary' : user?.role === 'staff' ? 'secondary' : 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <TextField
          label="Họ và tên *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          fullWidth
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={saving}
          sx={{ minWidth: 160 }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Lưu Thay Đổi'}
        </Button>
      </Box>
    </Box>
  );
}
