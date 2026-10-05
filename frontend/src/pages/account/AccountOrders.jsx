import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { useAuth } from '../../context/AuthContext';
import { getMyOrders } from '../../lib/adminApi';
import { formatVND } from '../../lib/format';

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', color: 'warning' },
  confirmed: { label: 'Đã xác nhận', color: 'info' },
  delivering: { label: 'Đang giao hàng', color: 'primary' },
  shipping: { label: 'Đang giao hàng', color: 'primary' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
};

export default function AccountOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getMyOrders(token);
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#FFFFFF', borderRadius: 3, p: 4, border: '1px solid #F0DDE3' }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Bạn chưa có đơn đặt hoa nào
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Hãy chọn những bó hoa tươi thắm nhất gửi tặng người thân yêu của bạn nhé!
        </Typography>
        <Button component={RouterLink} to="/danh-muc" variant="contained" color="primary">
          Khám phá hoa tươi ngay
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Lịch Sử Đơn Hàng Của Bạn
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Theo dõi tiến độ chuẩn bị hoa và giao hàng
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {orders.map((order) => {
          const cfg = STATUS_MAP[order.status] || { label: order.status, color: 'default' };
          return (
            <Card key={order.id} sx={{ borderRadius: 3, border: '1px solid #F0DDE3' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.dark' }}>
                      Đơn hàng #{order.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đặt lúc: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
                    </Typography>
                  </Box>
                  <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Items */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  {(order.items || []).map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={item.image} variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'blush.main' }}>
                          <LocalFloristIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.name || item.productId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Số lượng: {item.quantity} x {formatVND(item.unitPrice)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatVND(item.lineTotal || (item.unitPrice * item.quantity))}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Footer details */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ maxWidth: 400 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Giao tới: <strong>{order.shipping?.fullName}</strong> ({order.shipping?.phone})
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Địa chỉ: {order.shipping?.address}, {order.shipping?.district}, {order.shipping?.city}
                    </Typography>
                    {order.shipping?.cardMessage && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', fontStyle: 'italic', mt: 0.5 }}>
                        💌 Thiệp: &ldquo;{order.shipping.cardMessage}&rdquo;
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Tổng thanh toán:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
                      {formatVND(order.total)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
