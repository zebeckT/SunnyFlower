import Box from '@mui/material/Box';

const PLACEHOLDER = '/images/flower-placeholder.svg';

export function handleImageError(event) {
  const target = event.currentTarget;
  if (!target.src.endsWith(PLACEHOLDER)) {
    target.src = PLACEHOLDER;
  }
}

export default function SafeImage({ src, alt = '', sx, ...props }) {
  return (
    <Box
      component="img"
      src={src || PLACEHOLDER}
      alt={alt}
      onError={handleImageError}
      sx={{ display: 'block', objectFit: 'cover', bgcolor: 'blush.main', ...sx }}
      {...props}
    />
  );
}
