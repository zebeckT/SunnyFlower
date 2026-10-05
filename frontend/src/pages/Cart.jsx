import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useCart } from '../context/CartContext';
import { formatVND } from '../lib/format';
import { EmptyState } from '../components/PageBits';
import QuantityStepper from '../components/QuantityStepper';
import OrderSummary from '../components/OrderSummary';

function CartItem({ item }) {
  const { setQty, remove } = useCart();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        borderRadius: 4,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}
    >
      <Box
        component="img"
        src={item.image}
        alt={item.name}
        sx={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 3 }}
      />

      <Box sx={{ flex: 1, minWidth: 140 }}>
        <Link
          component={RouterLink}
          to={`/san-pham/${item.productId}`}
          color="text.primary"
          sx={{ fontWeight: 600 }}
        >
          {item.name}
        </Link>
        {item.size && (
          <Typography variant="body2" color="text.secondary">
            Kích cỡ: {item.size}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {formatVND(item.price)}
        </Typography>
      </Box>

      <QuantityStepper
        value={item.quantity}
        onChange={(val) => setQty(item.key, val)}
        label={`số lượng ${item.name}`}
      />

      <Typography sx={{ fontWeight: 700, minWidth: 100, textAlign: 'right' }} color="primary">
        {formatVND(item.price * item.quantity)}
      </Typography>

      <IconButton aria-label={`Xóa ${item.name}`} onClick={() => remove(item.key)}>
        <DeleteOutlinedIcon />
      </IconButton>
    </Paper>
  );
}

export default function Cart() {
  const { items, count, total } = useCart();

  if (items.length === 0) {
    return (
      <Container>
        <EmptyState
          title="Giỏ hàng trống"
          text="Hãy chọn vài bó hoa xinh để trao yêu thương."
          actionLabel="Mua sắm ngay"
          to="/danh-muc"
        />
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 3, md: 5 }, pb: { xs: 12, md: 5 } }}>
      <Typography variant="h3" component="h1" sx={{ mb: 3 }}>
        Giỏ hàng ({count})
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item) => (
              <CartItem key={item.key} item={item} />
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <OrderSummary>
            <Button
              component={RouterLink}
              to="/thanh-toan"
              variant="contained"
              fullWidth
              size="large"
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            >
              Thanh toán
            </Button>
            <Button component={RouterLink} to="/danh-muc" fullWidth sx={{ mt: 1 }}>
              Tiếp tục mua
            </Button>
          </OrderSummary>
        </Grid>
      </Grid>

      <Paper
        elevation={8}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
          p: 1.5,
          gap: 2,
          alignItems: 'center',
          borderRadius: 0,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Tổng cộng
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {formatVND(total)}
          </Typography>
        </Box>
        <Button component={RouterLink} to="/thanh-toan" variant="contained">
          Thanh toán
        </Button>
      </Paper>
    </Container>
  );
}
