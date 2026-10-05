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
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { useAuth } from '../../context/AuthContext';
import { formatVND } from '../../lib/format';
import {
  getAdminCategories,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
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

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: '',
    price: 350000,
    stock: 20,
    featured: false,
    image: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        getAdminCategories(),
        getAdminProducts({
          categoryId: categoryFilter || undefined,
          search: search || undefined,
          pageSize: 50,
        }),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(prods?.items || prods?.data || (Array.isArray(prods) ? prods : []));
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Không thể tải dữ liệu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleAdd = () => {
    setIsEditing(false);
    const defaultCat = categories[0]?.id || 'hoa-hong';
    setFormData({
      id: '',
      name: '',
      categoryId: defaultCat,
      price: 350000,
      stock: 20,
      featured: false,
      image: '',
      description: '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setFormData({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
      featured: !!product.featured,
      image: product.image || '',
      description: product.description || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(
      isEditing
        ? (prev) => ({ ...prev, name: val })
        : (prev) => ({ ...prev, name: val, id: slugify(val) })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim() || !formData.categoryId) {
      setFormError('Vui lòng điền đầy đủ Mã ID, Tên sản phẩm và Danh mục.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (isEditing) {
        await updateProduct(
          formData.id,
          {
            name: formData.name.trim(),
            categoryId: formData.categoryId,
            price: Number(formData.price),
            stock: Number(formData.stock),
            featured: formData.featured,
            image: formData.image.trim() || null,
            description: formData.description.trim() || null,
            images: [],
          },
          token
        );
        setSnackbar({ open: true, message: `Đã cập nhật sản phẩm "${formData.name}"`, severity: 'success' });
      } else {
        await createProduct(
          {
            id: formData.id.trim(),
            name: formData.name.trim(),
            categoryId: formData.categoryId,
            price: Number(formData.price),
            stock: Number(formData.stock),
            featured: formData.featured,
            image: formData.image.trim() || null,
            description: formData.description.trim() || null,
            images: [],
          },
          token
        );
        setSnackbar({ open: true, message: `Đã thêm sản phẩm mới "${formData.name}"`, severity: 'success' });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id, token);
      setSnackbar({ open: true, message: `Đã xóa sản phẩm "${deleteTarget.name}"`, severity: 'success' });
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Không thể xóa sản phẩm này', severity: 'error' });
      setDeleteOpen(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : categoryId;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Quản Lý Sản Phẩm Hoa
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Danh sách tất cả bó hoa, lẵng hoa, kệ hoa trong cửa hàng
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ borderColor: 'divider' }}>
            Làm mới
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd} sx={{ fontWeight: 700 }}>
            Thêm Sản Phẩm
          </Button>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, minWidth: 240, display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Tìm theo tên sản phẩm..."
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
          label="Lọc theo danh mục"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tất cả danh mục</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LocalFloristIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy sản phẩm nào
            </Typography>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd} sx={{ mt: 2 }}>
              Thêm sản phẩm mới
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead sx={{ bgcolor: 'blush.main' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 70 }}>Hình ảnh</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tên sản phẩm</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Danh mục</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Giá bán</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tồn kho</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Nổi bật</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Avatar src={product.image} alt={product.name} sx={{ width: 50, height: 50, borderRadius: 2 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        {product.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getCategoryName(product.categoryId)} size="small" sx={{ bgcolor: 'blush.main', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatVND(product.price)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${product.stock ?? 0} bó`}
                        size="small"
                        color={(product.stock ?? 0) > 5 ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {product.featured ? (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: '1rem !important' }} />}
                          label="Nổi bật"
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {'—'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa sản phẩm">
                        <IconButton color="primary" onClick={() => handleEdit(product)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa sản phẩm">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setDeleteTarget(product);
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
          {isEditing ? `Sửa Sản Phẩm: ${formData.name}` : 'Thêm Mới Sản Phẩm Hoa'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              label="Tên sản phẩm hoa"
              placeholder="VD: Bó Hồng Đỏ Juliet 20 Bông..."
              value={formData.name}
              onChange={handleNameChange}
              required
              fullWidth
              autoFocus
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Mã ID (Slug)"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
                disabled={isEditing}
                helperText={isEditing ? 'Không thể đổi ID' : 'Tự động tạo theo tên'}
              />
              <TextField
                select
                label="Danh mục hoa"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Giá bán (VND)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">đ</InputAdornment>,
                }}
              />
              <TextField
                label="Số lượng tồn kho"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </Box>
            <TextField
              label="Đường dẫn ảnh đại diện (Image URL)"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              fullWidth
            />
            {formData.image && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'blush.main', p: 1.5, borderRadius: 2 }}>
                <Avatar src={formData.image} alt="Xem trước ảnh sản phẩm" sx={{ width: 64, height: 64, borderRadius: 2 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Xem trước hình ảnh sản phẩm
                </Typography>
              </Box>
            )}
            <TextField
              label="Mô tả chi tiết bó hoa"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  color="warning"
                />
              }
              label="Đặt làm sản phẩm Nổi Bật (hiển thị trang chủ)"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting} color="inherit">
              Hủy
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting} sx={{ px: 3 }}>
              {submitting ? <CircularProgress size={24} color="inherit" /> : isEditing ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Xác Nhận Xóa Sản Phẩm?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteTarget?.name}</strong>? Thao tác này không thể hoàn tác.
          </Typography>
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
