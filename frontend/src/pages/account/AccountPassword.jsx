import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../context/AuthContext';

export default function AccountPassword() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ text: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ text: '', severity: 'success' });

    if (!currentPassword) {
      setAlert({ text: 'Vui lòng nhập mật khẩu hiện tại.', severity: 'error' });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setAlert({ text: 'Mật khẩu mới phải có tối thiểu 8 ký tự.', severity: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ text: 'Xác nhận mật khẩu mới không trùng khớp.', severity: 'error' });
      return;
    }

    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);

    if (result.success) {
      setAlert({
        text: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.',
        severity: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setAlert({ text: result.error || 'Đổi mật khẩu thất bại.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Đổi Mật Khẩu
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cập nhật mật khẩu định kỳ để nâng cao bảo mật tài khoản
      </Typography>

      {alert.text && (
        <Alert severity={alert.severity} sx={{ mb: 3, borderRadius: 2 }}>
          {alert.text}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Mật khẩu hiện tại *"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2.5 }}
        />
        <TextField
          label="Mật khẩu mới (tối thiểu 8 ký tự) *"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2.5 }}
        />
        <TextField
          label="Xác nhận mật khẩu mới *"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Cập Nhật Mật Khẩu'}
        </Button>
      </Box>
    </Box>
  );
}
