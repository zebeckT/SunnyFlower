import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
} from '../../lib/adminApi';

const ROLE_MAP = {
  admin: { label: 'Quản trị viên', color: 'primary' },
  staff: { label: 'Nhân viên', color: 'secondary' },
  customer: { label: 'Khách hàng', color: 'default' },
};

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ fullName: '', email: '', password: '', roleId: 'staff' });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers(
        { search: search || undefined, role: roleFilter || undefined, pageSize: 50 },
        token
      );
      setUsers(res?.items || []);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Không thể tải danh sách tài khoản', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenAdd = () => {
    setAddForm({ fullName: '', email: '', password: '', roleId: 'staff' });
    setAddError('');
    setAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.email.trim() || !addForm.password) {
      setAddError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (addForm.password.length < 8) {
      setAddError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    setAddSubmitting(true);
    setAddError('');
    try {
      await createUser(addForm, token);
      setSnackbar({ open: true, message: `Đã tạo tài khoản cho ${addForm.fullName}`, severity: 'success' });
      setAddOpen(false);
      fetchUsers();
    } catch (err) {
      setAddError(err.message || 'Không thể tạo tài khoản');
    } finally {
      setAddSubmitting(false);
    }
  };

  const openRoleDialog = (user) => {
    setRoleTarget(user);
    setNewRole(user.roleId);
    setRoleDialogOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!roleTarget || !newRole) return;
    setRoleSubmitting(true);
    try {
      await updateUserRole(roleTarget.id, newRole, token);
      setSnackbar({ open: true, message: `Đã cập nhật vai trò cho ${roleTarget.fullName}`, severity: 'success' });
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Không thể đổi vai trò', severity: 'error' });
    } finally {
      setRoleSubmitting(false);
    }
  };

  const openStatusDialog = (user) => {
    setRoleTarget(user);
    setStatusDialogOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!roleTarget) return;
    setStatusSubmitting(true);
    const newActive = !roleTarget.isActive;
    try {
      await toggleUserStatus(roleTarget.id, newActive, token);
      setSnackbar({
        open: true,
        message: newActive
          ? `Đã mở khóa tài khoản ${roleTarget.fullName}`
          : `Đã khóa tài khoản ${roleTarget.fullName}`,
        severity: 'success',
      });
      setStatusDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Lỗi khi cập nhật trạng thái tài khoản', severity: 'error' });
    } finally {
      setStatusSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Quản Lý Người Dùng & Phân Quyền
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Tạo tài khoản nhân viên, phân quyền và kiểm soát trạng thái hoạt động
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchUsers} sx={{ borderColor: 'divider' }}>
            Làm mới
          </Button>
          <Button variant="contained" color="primary" startIcon={<PersonAddIcon />} onClick={handleOpenAdd} sx={{ fontWeight: 700 }}>
            Thêm Tài Khoản
          </Button>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, minWidth: 260, display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Tìm
          </Button>
        </Box>
        <TextField
          select
          size="small"
          label="Lọc vai trò"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tất cả vai trò</MenuItem>
          <MenuItem value="admin">Quản trị viên (Admin)</MenuItem>
          <MenuItem value="staff">Nhân viên (Staff)</MenuItem>
          <MenuItem value="customer">Khách hàng (Customer)</MenuItem>
        </TextField>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PeopleAltIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy người dùng nào
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: 'blush.main' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Người dùng</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vai trò</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày tham gia</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => {
                  const role = ROLE_MAP[u.roleId] || { label: u.roleId, color: 'default' };
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: role.color === 'primary' ? 'primary.main' : 'secondary.main',
                            width: 36,
                            height: 36,
                            fontSize: '0.85rem',
                          }}
                        >
                          {u.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {u.fullName}{' '}
                            {isSelf && (
                              <Typography component="span" variant="caption" color="primary">
                                (Bạn)
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{u.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={role.label} color={role.color} size="small" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                          color={u.isActive ? 'success' : 'error'}
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Đổi vai trò">
                          <IconButton color="primary" onClick={() => openRoleDialog(u)} size="small">
                            <ManageAccountsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!isSelf && (
                          <Tooltip title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                            <IconButton
                              color={u.isActive ? 'error' : 'success'}
                              onClick={() => openStatusDialog(u)}
                              size="small"
                            >
                              {u.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={addOpen} onClose={() => !addSubmitting && setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Tạo Tài Khoản Mới
        </DialogTitle>
        <Box component="form" onSubmit={handleAddSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {addError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {addError}
              </Alert>
            )}
            <TextField
              label="Họ và tên *"
              value={addForm.fullName}
              onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Email đăng nhập *"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Mật khẩu (tối thiểu 8 ký tự) *"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              required
              fullWidth
            />
            <TextField
              select
              label="Vai trò *"
              value={addForm.roleId}
              onChange={(e) => setAddForm({ ...addForm, roleId: e.target.value })}
              fullWidth
            >
              <MenuItem value="staff">Nhân viên (Staff)</MenuItem>
              <MenuItem value="admin">Quản trị viên (Admin)</MenuItem>
              <MenuItem value="customer">Khách hàng (Customer)</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setAddOpen(false)} disabled={addSubmitting} color="inherit">
              Hủy
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={addSubmitting}>
              {addSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Tạo Tài Khoản'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={roleDialogOpen} onClose={() => !roleSubmitting && setRoleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Thay Đổi Vai Trò: {roleTarget?.fullName}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Chọn vai trò mới cho tài khoản <strong>{roleTarget?.email}</strong>:
          </Typography>
          <TextField
            select
            label="Vai trò mới"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            fullWidth
          >
            <MenuItem value="customer">Khách hàng (Customer)</MenuItem>
            <MenuItem value="staff">Nhân viên (Staff)</MenuItem>
            <MenuItem value="admin">Quản trị viên (Admin)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRoleDialogOpen(false)} color="inherit" disabled={roleSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleRoleUpdate} variant="contained" color="primary" disabled={roleSubmitting}>
            {roleSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Lưu Thay Đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusDialogOpen} onClose={() => !statusSubmitting && setStatusDialogOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: roleTarget?.isActive ? 'error.main' : 'success.main' }}>
          {roleTarget?.isActive ? 'Xác Nhận Khóa Tài Khoản?' : 'Xác Nhận Mở Khóa Tài Khoản?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Bạn có chắc chắn muốn {roleTarget?.isActive ? 'khóa' : 'mở khóa'} tài khoản của{' '}
            <strong>{roleTarget?.fullName}</strong> ({roleTarget?.email})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)} color="inherit" disabled={statusSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleToggleStatus}
            variant="contained"
            color={roleTarget?.isActive ? 'error' : 'success'}
            disabled={statusSubmitting}
          >
            {statusSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Xác Nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
