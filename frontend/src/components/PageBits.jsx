import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

export function Crumbs({ items }) {
  return (
    <Breadcrumbs aria-label="Đường dẫn" sx={{ mb: 2 }}>
      <Link component={RouterLink} to="/" color="inherit">
        Trang chủ
      </Link>
      {items.map((item, index) =>
        item.to && index < items.length - 1 ? (
          <Link key={item.label} component={RouterLink} to={item.to} color="inherit">
            {item.label}
          </Link>
        ) : (
          <Typography key={item.label} color="text.primary" aria-current="page">
            {item.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}

export function EmptyState({ title, text, actionLabel, to }) {
  return (
    <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          bgcolor: 'blush.main',
          color: 'primary.main',
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <LocalFloristIcon sx={{ fontSize: 48 }} />
      </Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {title}
      </Typography>
      {text && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {text}
        </Typography>
      )}
      {actionLabel && (
        <Button component={RouterLink} to={to} variant="contained">
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

export const SectionTitle = ({ children, action }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      mb: 3,
      gap: 2,
    }}
  >
    <Typography variant="h3" component="h2">
      {children}
    </Typography>
    {action}
  </Box>
);

export const ErrorBox = ({ error }) => (
  <Alert severity="error" sx={{ my: 3 }}>
    {error?.message || 'Không tải được dữ liệu. Vui lòng thử lại.'}
  </Alert>
);
