import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { getProducts, getCategories } from '../lib/api';
import { SectionTitle, ErrorBox } from '../components/PageBits';
import ProductGrid from '../components/ProductGrid';
import useAsync from '../lib/useAsync';

const BENEFITS = [
  {
    icon: <LocalShippingOutlinedIcon fontSize="large" />,
    title: 'Giao trong 2 giờ',
    text: 'Nội thành TP.HCM, đúng giờ hẹn.',
  },
  {
    icon: <LocalFloristOutlinedIcon fontSize="large" />,
    title: 'Hoa tươi 100%',
    text: 'Cắt mới mỗi sáng, cam kết độ tươi.',
  },
  {
    icon: <CardGiftcardIcon fontSize="large" />,
    title: 'Miễn phí thiệp',
    text: 'Viết lời nhắn gửi theo yêu cầu.',
  },
  {
    icon: <AutorenewIcon fontSize="large" />,
    title: 'Đổi trả dễ dàng',
    text: 'Hoa không đúng mẫu được đổi ngay.',
  },
];

const REVIEWS = [
  {
    name: 'Nguyễn Thị Lan',
    text: 'Hoa tươi, gói rất đẹp, giao đúng giờ. Mẹ mình rất vui!',
    rating: 5,
  },
  {
    name: 'Trần Minh Khoa',
    text: 'Đặt hoa khai trương cho công ty, kệ hoa sang trọng, giá hợp lý.',
    rating: 5,
  },
  {
    name: 'Lê Phương Anh',
    text: 'Bó hồng pastel xinh hơn ảnh. Sẽ ủng hộ tiếp.',
    rating: 4.5,
  },
];

export default function Home() {
  const categories = useAsync(getCategories, []);
  const products = useAsync(() => getProducts({ featured: true, limit: 8 }), []);

  return (
    <>
      <Box sx={{ bgcolor: 'blush.main' }}>
        <Container sx={{ py: { xs: 4, md: 8 } }}>
          <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 2, md: 1 } }}>
              <Typography variant="h1" component="h1" gutterBottom>
                Hoa tươi mỗi ngày – trao trọn yêu thương
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 480 }}>
                Hoa hồng, hoa sinh nhật, hoa cưới, hoa khai trương – chọn nhanh, giao tận nơi
                trong 2 giờ.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button component={RouterLink} to="/danh-muc" variant="contained" size="large">
                  Mua ngay
                </Button>
                <Button component={RouterLink} to="/danh-muc" variant="outlined" size="large">
                  Xem danh mục
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 1, md: 2 } }}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1000"
                alt="Bó hoa hồng đỏ SunnyFlower"
                sx={{
                  width: '100%',
                  aspectRatio: { xs: '4 / 3', md: '1 / 1' },
                  objectFit: 'cover',
                  borderRadius: '24px',
                  display: 'block',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ mt: { xs: 5, md: 8 } }}>
        <SectionTitle>Danh mục nổi bật</SectionTitle>
        {categories.error && <ErrorBox error={categories.error} />}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {(
            categories.data ||
            (categories.loading ? Array.from({ length: 4 }, (_, i) => ({ id: i })) : [])
          ).map((cat) => (
            <Grid key={cat.id} size={{ xs: 6, md: 3 }}>
              {categories.loading ? (
                <Skeleton variant="rounded" sx={{ aspectRatio: '1 / 1', height: 'auto' }} />
              ) : (
                <Card>
                  <CardActionArea component={RouterLink} to={`/danh-muc?loai=${cat.id}`}>
                    <CardMedia
                      component="img"
                      image={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      sx={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
                    />
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" component="h3">
                        {cat.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              )}
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container sx={{ mt: { xs: 5, md: 8 } }}>
        <SectionTitle
          action={
            <Button component={RouterLink} to="/danh-muc">
              Xem tất cả
            </Button>
          }
        >
          Bán chạy
        </SectionTitle>
        {products.error ? (
          <ErrorBox error={products.error} />
        ) : (
          <ProductGrid
            products={products.data?.data || []}
            loading={products.loading}
            skeletons={8}
          />
        )}
      </Container>

      <Container sx={{ mt: { xs: 5, md: 8 } }}>
        <Grid container spacing={3}>
          {BENEFITS.map((b) => (
            <Grid key={b.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box
                  sx={{
                    color: 'primary.main',
                    bgcolor: 'blush.main',
                    borderRadius: '50%',
                    p: 1.5,
                    display: 'flex',
                  }}
                >
                  {b.icon}
                </Box>
                <Box>
                  <Typography variant="h6" component="h3">
                    {b.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b.text}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container sx={{ mt: { xs: 5, md: 8 } }}>
        <SectionTitle>Khách hàng nói gì</SectionTitle>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: { xs: 'auto', md: 'visible' },
            scrollSnapType: 'x mandatory',
            pb: 1,
          }}
        >
          {REVIEWS.map((r) => (
            <Card key={r.name} sx={{ flex: { xs: '0 0 85%', md: 1 }, scrollSnapAlign: 'start' }}>
              <CardContent>
                <Rating value={r.rating} precision={0.5} readOnly sx={{ color: 'accent.main' }} />
                <Typography sx={{ my: 1 }}>"{r.text}"</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {r.name}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </>
  );
}
