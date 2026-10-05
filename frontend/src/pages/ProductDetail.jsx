import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { Crumbs, EmptyState, SectionTitle, ErrorBox } from '../components/PageBits';
import QuantityStepper from '../components/QuantityStepper';
import ProductGrid from '../components/ProductGrid';
import { useToast } from '../components/Toast';
import { useCart } from '../context/CartContext';
import useAsync from '../lib/useAsync';
import { getProduct, getProducts, getCategories } from '../lib/api';
import { formatVND } from '../lib/format';
import { handleImageError } from '../components/SafeImage';

const SIZES = ['S', 'M', 'L'];
const CARE = [
  'Cắt chéo 2–3cm cuống hoa dưới vòi nước chảy.',
  'Thay nước sạch mỗi ngày, bỏ lá ngập nước.',
  'Để nơi thoáng mát, tránh nắng gắt và quạt gió trực tiếp.',
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const toast = useToast();
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [tab, setTab] = useState(0);

  const prod = useAsync(() => getProduct(id), [id]);
  const cats = useAsync(getCategories, []);
  const p = prod.data;
  const related = useAsync(
    () => (p ? getProducts({ category: p.categoryId, limit: 5 }) : Promise.resolve({ data: [] })),
    [p?.categoryId]
  );

  useEffect(() => { setQty(1); setImg(0); setTab(0); }, [id]);

  if (prod.loading) {
    return (
      <Container sx={{ py: 5 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" sx={{ aspectRatio: '1 / 1', height: 'auto' }} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton height={60} /><Skeleton width="40%" /><Skeleton height={120} /></Grid>
        </Grid>
      </Container>
    );
  }
  if (prod.error) {
    return (
      <Container sx={{ py: 5 }}>
        {prod.error.status === 404 ? (
          <EmptyState title="Không tìm thấy sản phẩm" text="Sản phẩm không tồn tại hoặc đã ngừng bán." actionLabel="Xem danh mục" to="/danh-muc" />
        ) : (
          <ErrorBox error={prod.error} />
        )}
      </Container>
    );
  }

  const images = p.images?.length ? p.images : [p.image];
  const soldOut = p.stock <= 0;
  const cat = cats.data?.find((c) => c.id === p.categoryId);
  const item = { productId: p.id, name: p.name, image: p.image, price: p.price, size, quantity: qty };
  const addToCart = () => { add(item); toast(`Đã thêm "${p.name}" vào giỏ`); };
  const buyNow = () => { add(item); navigate('/gio-hang'); };
  const others = (related.data?.data || []).filter((x) => x.id !== p.id).slice(0, 4);

  return (
    <Container sx={{ py: { xs: 3, md: 5 }, pb: { xs: 12, md: 5 } }}>
      <Crumbs items={[{ label: 'Danh mục', to: '/danh-muc' }, ...(cat ? [{ label: cat.name, to: `/danh-muc?loai=${cat.id}` }] : []), { label: p.name }]} />
      <Grid container spacing={{ xs: 3, md: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box component="img" src={images[img]} alt={p.name} onError={handleImageError} sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '24px', display: 'block', bgcolor: 'blush.main' }} />
          {images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, overflowX: 'auto' }}>
              {images.slice(0, 4).map((src, i) => (
                <Box
                  key={src + i}
                  component="button"
                  type="button"
                  onClick={() => setImg(i)}
                  aria-label={`Xem ảnh ${i + 1}`}
                  aria-pressed={i === img}
                  sx={{ p: 0, border: 2, borderColor: i === img ? 'primary.main' : 'transparent', borderRadius: 3, overflow: 'hidden', width: 72, height: 72, flex: '0 0 auto', cursor: 'pointer', bgcolor: 'transparent' }}
                >
                  <Box component="img" src={src} alt="" onError={handleImageError} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom>{p.name}</Typography>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 2 }}>{formatVND(p.price)}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{p.description}</Typography>

          <Typography variant="h6" gutterBottom id="size-label">Kích cỡ</Typography>
          <ToggleButtonGroup exclusive value={size} onChange={(_, v) => v && setSize(v)} aria-labelledby="size-label" color="primary" sx={{ mb: 3 }}>
            {SIZES.map((s) => <ToggleButton key={s} value={s} sx={{ minWidth: 56, minHeight: 44 }}>{s}</ToggleButton>)}
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <QuantityStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} max={p.stock} />
            {soldOut ? <Chip label="Hết hàng" /> : <Typography variant="body2" color="text.secondary">Còn {p.stock} sản phẩm</Typography>}
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button variant="contained" size="large" onClick={addToCart} disabled={soldOut}>Thêm vào giỏ</Button>
            <Button variant="outlined" size="large" onClick={buyNow} disabled={soldOut}>Mua ngay</Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 3, color: 'text.secondary' }}>
            <LocalShippingOutlinedIcon color="secondary" />
            <Typography variant="body2">Giao trong 2 giờ nội thành. Miễn phí giao hàng cho đơn từ 500.000₫.</Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: { xs: 4, md: 8 } }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" aria-label="Thông tin sản phẩm">
          <Tab label="Mô tả" />
          <Tab label="Chăm sóc hoa" />
          <Tab label="Đánh giá" />
        </Tabs>
        <Box sx={{ py: 3 }} role="tabpanel">
          {tab === 0 && <Typography>{p.description}</Typography>}
          {tab === 1 && <Box component="ul" sx={{ m: 0, pl: 3 }}>{CARE.map((c) => <li key={c}><Typography>{c}</Typography></li>)}</Box>}
          {tab === 2 && <Typography color="text.secondary">Chưa có đánh giá cho sản phẩm này.</Typography>}
        </Box>
      </Box>

      {others.length > 0 && (
        <Box sx={{ mt: { xs: 3, md: 6 } }}>
          <SectionTitle>Sản phẩm liên quan</SectionTitle>
          <ProductGrid products={others} />
        </Box>
      )}

      <Paper elevation={8} sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1100, p: 1.5, gap: 2, alignItems: 'center', borderRadius: 0 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700, flex: 1 }}>{formatVND(p.price * qty)}</Typography>
        <Button variant="contained" onClick={addToCart} disabled={soldOut}>Thêm vào giỏ</Button>
      </Paper>
    </Container>
  );
}
