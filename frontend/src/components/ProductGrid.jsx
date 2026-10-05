import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { formatVND } from '../lib/format';
import { handleImageError } from './SafeImage';

function ProductCard({ product }) {
  const { add } = useCart();
  const toast = useToast();
  const soldOut = product.stock <= 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component={RouterLink}
        to={`/san-pham/${product.id}`}
        sx={{ position: 'relative' }}
      >
        <CardMedia
          component="img"
          image={product.image}
          alt={product.name}
          loading="lazy"
          onError={handleImageError}
          sx={{ aspectRatio: '4 / 5', objectFit: 'cover', bgcolor: 'blush.main' }}
        />
        {product.featured && (
          <Chip
            label="Bán chạy"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'accent.main',
              color: 'accent.contrastText',
            }}
          />
        )}
        {soldOut && (
          <Chip
            label="Hết hàng"
            size="small"
            color="default"
            sx={{ position: 'absolute', top: 12, right: 12 }}
          />
        )}
        <CardContent sx={{ pb: 0 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              minHeight: '2.8em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {formatVND(product.price)}
          </Typography>
        </CardContent>
      </CardActionArea>

      <Box sx={{ flex: 1 }} />

      <CardActions sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddShoppingCartIcon />}
          onClick={() => {
            add({
              productId: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              size: '',
              quantity: 1,
            });
            toast(`Đã thêm "${product.name}" vào giỏ`);
          }}
          disabled={soldOut}
        >
          Thêm vào giỏ
        </Button>
      </CardActions>
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card sx={{ '&:hover': { transform: 'none' } }}>
      <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 5', width: '100%', height: 'auto' }} />
      <CardContent>
        <Skeleton width="80%" />
        <Skeleton width="40%" />
      </CardContent>
    </Card>
  );
}

export default function ProductGrid({ products, loading, cols = 4, skeletons = 4 }) {
  const colSize = 12 / cols;
  const items = loading ? Array.from({ length: skeletons }, (_, i) => ({ id: i })) : products;

  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {items.map((item) => (
        <Grid key={item.id} size={{ xs: 6, sm: 4, md: colSize }}>
          {loading ? <ProductSkeleton /> : <ProductCard product={item} />}
        </Grid>
      ))}
    </Grid>
  );
}
