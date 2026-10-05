import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { useCart } from '../context/CartContext';
import { formatVND } from '../lib/format';

function Row({ label, value, bold, color }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography sx={{ fontWeight: bold ? 700 : 400 }}>{label}</Typography>
      <Typography sx={{ fontWeight: bold ? 700 : 400 }} color={color}>
        {value}
      </Typography>
    </Box>
  );
}

export default function OrderSummary({ children, showItems }) {
  const { items, subtotal, shippingFee, total } = useCart();

  return (
    <Card sx={{ '&:hover': { transform: 'none' } }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Tóm tắt đơn hàng
        </Typography>

        {showItems &&
          items.map((item) => (
            <Box
              key={item.key}
              sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}
            >
              <Box
                component="img"
                src={item.image}
                alt=""
                sx={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 2 }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {item.name}
                {item.size ? ` (${item.size})` : ''}
                {' × '}
                {item.quantity}
              </Typography>
              <Typography variant="body2">
                {formatVND(item.price * item.quantity)}
              </Typography>
            </Box>
          ))}

        {showItems && <Divider sx={{ my: 1.5 }} />}

        <Row label="Tạm tính" value={formatVND(subtotal)} />
        <Row
          label="Phí giao hàng"
          value={shippingFee ? formatVND(shippingFee) : 'Miễn phí'}
        />
        {shippingFee > 0 && (
          <Typography variant="caption" color="text.secondary">
            Mua thêm {formatVND(500000 - subtotal)} để được miễn phí giao hàng.
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Row label="Tổng cộng" value={formatVND(total)} bold color="primary" />

        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
