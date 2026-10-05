import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CategoryIcon from '@mui/icons-material/Category';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../lib/adminApi';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', description: '', image: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ id: '', name: '', description: '', image: '' });
    setFormError('');
    setDialogOpen(true);
  };

  const handleEdit = (cat) => {
    setIsEditing(true);
    setFormData({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim()) {
      setFormError('Mã định danh và Tên danh mục không được để trống.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (isEditing) {
        await updateCategory(
          formData.id,
          {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            image: formData.image.trim() || null,
          },
          token
        );
        setSnackbar({ open: true, message: `Đã cập nhật danh mục "${formData.name}"`, severity: 'success' });
      } else {
        await createCategory(
          {
            id: formData.id.trim(),
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            image: formData.image.trim() || null,
          },
          token
        );
        setSnackbar({ open: true, message: `Đã tạo danh mục mới "${formData.name}"`, severity: 'success' });
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id, token);
      setSnackbar({ open: true, message: `Đã xóa danh mục "${deleteTarget.name}"`, severity: 'success' });
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Không thể xóa danh mục này', severity: 'error' });
      setDeleteOpen(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Quản Lý Danh Mục Hoa
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Tạo mới, chỉnh sửa thông tin các loại hoa cho SunnyFlower
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchCategories} sx={{ borderColor: 'divider' }}>
            Làm mới
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd} sx={{ fontWeight: 700 }}>
            Thêm Danh Mục
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : categories.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              Chưa có danh mục nào
            </Typography>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd} sx={{ mt: 2 }}>
              Thêm danh mục đầu tiên
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'blush.main' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 80 }}>Hình ảnh</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tên danh mục</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mã định danh (ID)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Avatar src={cat.image} alt={cat.name} sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: '#f0e6e8' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1rem' }}>
                      {cat.name}
                    </TableCell>
                    <TableCell>
                      <Box
                        component="code"
                        sx={{
                          bgcolor: 'blush.main',
                          color: 'primary.dark',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        {cat.id}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', maxWidth: 300 }}>
                      {cat.description || '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton color="primary" onClick={() => handleEdit(cat)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa danh mục">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setDeleteTarget(cat);
                            setDeleteOpen(true);
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          {isEditing ? `Sửa Danh Mục: ${formData.name}` : 'Thêm Mới Danh Mục Hoa'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              label="Tên danh mục hoa"
              placeholder="VD: Hoa Tulip, Hoa Hồng Đà Lạt..."
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(
                  isEditing
                    ? (prev) => ({ ...prev, name: val })
                    : (prev) => ({ ...prev, name: val, id: slugify(val) })
                );
              }}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Mã ID (Slug định danh URL)"
              placeholder="VD: hoa-tulip, hoa-hong"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              fullWidth
              disabled={isEditing}
              helperText={
                isEditing
                  ? 'Mã ID không thể thay đổi sau khi tạo'
                  : 'Tự động tạo từ tên hoặc tự nhập không dấu, phân tách bằng dấu gạch ngang'
              }
            />
            <TextField
              label="Mô tả danh mục"
              placeholder="VD: Bó hoa tulip tươi nhập khẩu từ Hà Lan với màu sắc rực rỡ..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Đường dẫn ảnh đại diện (Image URL)"
              placeholder="https://..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              fullWidth
            />
            {formData.image && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'blush.main', p: 1.5, borderRadius: 2 }}>
                <Avatar src={formData.image} alt="Xem trước ảnh danh mục" sx={{ width: 64, height: 64, borderRadius: 2 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Xem trước ảnh đại diện danh mục
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting} color="inherit">
              Hủy
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting} sx={{ px: 3 }}>
              {submitting ? <CircularProgress size={24} color="inherit" /> : isEditing ? 'Lưu Thay Đổi' : 'Thêm Danh Mục'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Xác Nhận Xóa Danh Mục?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bạn có chắc chắn muốn xóa danh mục <strong>{deleteTarget?.name}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
            Lưu ý: Chỉ danh mục không còn chứa sản phẩm nào mới có thể xóa thành công.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xác Nhận Xóa
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
