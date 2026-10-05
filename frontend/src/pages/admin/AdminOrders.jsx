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
import Divider from '@mui/material/Divider';
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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useAuth } from '../../context/AuthContext';
import { formatVND } from '../../lib/format';
import { getAdminOrders, getAdminOrder, updateOrderStatus } from '../../lib/adminApi';

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', color: 'warning', icon: <AccessTimeIcon fontSize="small" /> },
  confirmed: { label: 'Đã xác nhận', color: 'info', icon: <CheckCircleIcon fontSize="small" /> },
  delivering: { label: 'Đang giao hàng', color: 'primary', icon: <LocalShippingIcon fontSize="small" /> },
  shipping: { label: 'Đang giao hàng', color: 'primary', icon: <LocalShippingIcon fontSize="small" /> },
  completed: { label: 'Hoàn thành', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  cancelled: { label: 'Đã hủy', color: 'error', icon: <CancelIcon fontSize="small" /> },
};

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({ status: statusFilter || undefined, pageSize: 50 }, token);
      setOrders(res?.items || res?.data || (Array.isArray(res) ? res : []));
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Không thể tải danh sách đơn hàng', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const openDetail = async (orderId) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await getAdminOrder(orderId, token);
      setOrderDetail(data);
      setSelectedStatus(data.status);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Lỗi khi tải chi tiết đơn hàng', severity: 'error' });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!orderDetail || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderDetail.id, selectedStatus, token);
      setSnackbar({ open: true, message: `Đã cập nhật trạng thái đơn ${orderDetail.id}`, severity: 'success' });
      setOrderDetail((prev) => ({ ...prev, status: selectedStatus }));
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Lỗi cập nhật trạng thái', severity: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Quản Lý Đơn Hàng Hoa
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Theo dõi, xử lý và cập nhật tiến độ giao các đơn đặt hàng
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchOrders} sx={{ borderColor: 'divider' }}>
            Làm mới
          </Button>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          size="small"
          label="Lọc theo trạng thái đơn"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value="pending">Chờ xác nhận</MenuItem>
          <MenuItem value="confirmed">Đã xác nhận</MenuItem>
          <MenuItem value="delivering">Đang giao hàng</MenuItem>
          <MenuItem value="completed">Đã hoàn thành</MenuItem>
          <MenuItem value="cancelled">Đã hủy</MenuItem>
        </TextField>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBagIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              Chưa có đơn hàng nào
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: 'blush.main' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Mã đơn hàng</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Khách hàng / Người nhận</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Số điện thoại</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tổng tiền</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thời gian đặt</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const status = STATUS_MAP[order.status] || { label: order.status, color: 'default' };
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.dark' }}>
                        {order.id}
                      </TableCell>
                      <TableCell>
                        {/* BUG: Uses recipientName/customerName instead of shipping.fullName */}
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order.recipientName || order.customerName || 'Khách vãng lai'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block', maxWidth: 220 }}
                          noWrap
                        >
                          {order.recipientAddress || order.deliveryAddress || ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {order.recipientPhone || order.customerPhone || '—'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatVND(order.total)}
                      </TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Xem chi tiết đơn hàng">
                          <IconButton color="primary" onClick={() => openDetail(order.id)} size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Chi Tiết Đơn Hàng: {orderDetail?.id}</span>
          {orderDetail && (
            <Chip
              label={STATUS_MAP[orderDetail.status]?.label || orderDetail.status}
              color={STATUS_MAP[orderDetail.status]?.color || 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : orderDetail ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  bgcolor: 'blush.main',
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Người nhận hoa:
                  </Typography>
                  {/* BUG: Uses recipientName/customerName instead of shipping.fullName */}
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {orderDetail.recipientName || orderDetail.customerName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    SĐT: {orderDetail.recipientPhone || orderDetail.customerPhone}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Địa chỉ: {orderDetail.recipientAddress || orderDetail.deliveryAddress}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Thông tin đơn:
                  </Typography>
                  <Typography variant="body2">
                    PT Thanh toán: <strong>{orderDetail.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : orderDetail.paymentMethod}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Lời nhắn tặng hoa: <em>{orderDetail.cardMessage || orderDetail.note || 'Không có'}</em>
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Danh Sách Hoa Trong Đơn
                </Typography>
                <TableContainer sx={{ border: '1px solid #F0DDE3', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#FFF0F5' }}>
                      <TableRow>
                        <TableCell>Sản phẩm</TableCell>
                        <TableCell align="center">SL</TableCell>
                        <TableCell align="right">Đơn giá</TableCell>
                        <TableCell align="right">Thành tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(orderDetail.items || []).map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {/* BUG: Uses productImage instead of image */}
                            {item.productImage && (
                              <Avatar src={item.productImage} variant="rounded" sx={{ width: 36, height: 36 }} />
                            )}
                            {/* BUG: Uses productName instead of name */}
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.productName || item.productId}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{formatVND(item.unitPrice)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatVND(item.totalPrice || item.lineTotal || item.unitPrice * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                          Tổng cộng:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>
                          {formatVND(orderDetail.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Cập nhật trạng thái đơn hàng:
                </Typography>
                <TextField
                  select
                  size="small"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="pending">Chờ xác nhận</MenuItem>
                  <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                  <MenuItem value="delivering">Đang giao hàng</MenuItem>
                  <MenuItem value="completed">Đã hoàn thành</MenuItem>
                  <MenuItem value="cancelled">Đã hủy đơn</MenuItem>
                </TextField>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || selectedStatus === orderDetail.status}
                >
                  {updatingStatus ? <CircularProgress size={20} color="inherit" /> : 'Lưu Trạng Thái'}
                </Button>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailOpen(false)} color="inherit">
            Đóng
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
