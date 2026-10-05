import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

export default function QuantityStepper({ value, onChange, max = 20, label = 'số lượng' }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 999,
        bgcolor: 'background.paper',
      }}
    >
      <IconButton
        aria-label={`Giảm ${label}`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>

      <Typography
        component="span"
        aria-live="polite"
        sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}
      >
        {value}
      </Typography>

      <IconButton
        aria-label={`Tăng ${label}`}
        onClick={() => onChange(value + 1)}
        disabled={value >= Math.min(max, 20)}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
