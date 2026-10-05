import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

export const STORE_INFO = {
  address: '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  phone: '0901 234 567',
  email: 'xinchao@sunnyflower.vn',
  hours: '7:00 – 21:00, mỗi ngày',
};

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ bgcolor: 'blush.main', mt: { xs: 5, md: 8 }, py: { xs: 5, md: 6 } }}
    >
      <Container>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              SunnyFlower
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cửa hàng hoa tươi mỗi ngày – chọn hoa tận tâm, giao nhanh trong 2 giờ, trao trọn yêu thương.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Liên hệ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {STORE_INFO.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hotline:{' '}
              <Link href={`tel:${STORE_INFO.phone.replace(/\s/g, '')}`}>
                {STORE_INFO.phone}
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email:{' '}
              <Link href={`mailto:${STORE_INFO.email}`}>{STORE_INFO.email}</Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Giờ mở cửa: {STORE_INFO.hours}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Khám phá
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link component={RouterLink} to="/danh-muc" color="text.secondary">
                Danh mục sản phẩm
              </Link>
              <Link component={RouterLink} to="/gio-hang" color="text.secondary">
                Giỏ hàng
              </Link>
              <Link component={RouterLink} to="/lien-he" color="text.secondary">
                Liên hệ
              </Link>
            </Box>
            <Box sx={{ mt: 1 }}>
              <IconButton
                aria-label="Facebook"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="Instagram"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                aria-label="YouTube"
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 4 }}
        >
          © {new Date().getFullYear()} SunnyFlower. Bảo lưu mọi quyền.
        </Typography>
      </Container>
    </Box>
  );
}
