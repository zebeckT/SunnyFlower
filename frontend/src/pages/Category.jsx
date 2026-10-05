import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Slider from '@mui/material/Slider';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FilterListIcon from '@mui/icons-material/FilterList';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { getProducts, getCategories } from '../lib/api';
import { formatVND } from '../lib/format';
import { Crumbs, EmptyState, ErrorBox } from '../components/PageBits';
import ProductGrid from '../components/ProductGrid';
import useAsync from '../lib/useAsync';

const SORT_OPTIONS = [
  { v: 'moi-nhat', api: 'newest', label: 'Mới nhất' },
  { v: 'gia-tang', api: 'price_asc', label: 'Giá tăng dần' },
  { v: 'gia-giam', api: 'price_desc', label: 'Giá giảm dần' },
];

const MAX_PRICE = 3_000_000;
const PAGE_SIZE = 9;

const OCCASIONS = [
  { id: 'hoa-sinh-nhat', label: '🎂 Hoa Sinh Nhật' },
  { id: 'hoa-khai-truong', label: '🎉 Hoa Khai Trương' },
  { id: 'hoa-cuoi', label: '💍 Hoa Cưới & Kỷ Niệm' },
  { id: 'hoa-hong', label: '🌹 Tình Yêu & Lễ Hội' },
];

function Filters({ cats, loai, range, onLoai, onRange, onCommit }) {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 700 }}
        >
          <CelebrationIcon color="primary" fontSize="small" /> Dịp tặng
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {OCCASIONS.map((o) => (
            <Chip
              key={o.id}
              label={o.label}
              clickable
              color={loai === o.id ? 'primary' : 'default'}
              variant={loai === o.id ? 'filled' : 'outlined'}
              onClick={() => onLoai(loai === o.id ? '' : o.id)}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
        Khoảng giá
      </Typography>
      <Slider
        value={range}
        min={0}
        max={MAX_PRICE}
        step={50_000}
        onChange={(e, val) => onRange(val)}
        onChangeCommitted={(e, val) => onCommit(val)}
        valueLabelDisplay="auto"
        valueLabelFormat={formatVND}
        getAriaLabel={(i) => (i === 0 ? 'Giá thấp nhất' : 'Giá cao nhất')}
        sx={{ mx: 1, width: 'calc(100% - 16px)' }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {formatVND(range[0])} – {formatVND(range[1])}
      </Typography>

      <Divider sx={{ my: 2.5 }} />

      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
        Tất cả danh mục hoa
      </Typography>
      <List dense disablePadding>
        <ListItem selected={!loai} onClick={() => onLoai('')} sx={{ borderRadius: 2 }}>
          <ListItemText
            primary="Tất cả hoa"
            primaryTypographyProps={{ fontWeight: loai ? 500 : 700 }}
          />
        </ListItem>
        {(cats || []).map((cat) => (
          <ListItem
            key={cat.id}
            selected={loai === cat.id}
            onClick={() => onLoai(cat.id)}
            sx={{ borderRadius: 2 }}
          >
            <ListItemText
              primary={cat.name}
              primaryTypographyProps={{ fontWeight: loai === cat.id ? 700 : 500 }}
              secondary={cat.productCount == null ? null : `${cat.productCount} sản phẩm`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default function Category() {
  const [searchParams, setSearchParams] = useSearchParams();

  const loai = searchParams.get('loai') || '';
  const q = searchParams.get('q') || '';
  const sortOption =
    SORT_OPTIONS.find((s) => s.v === searchParams.get('sap-xep')) || SORT_OPTIONS[0];
  const page = Math.max(1, Number(searchParams.get('trang')) || 1);
  const minPrice = Number(searchParams.get('tu')) || 0;
  const maxPrice = Number(searchParams.get('den')) || MAX_PRICE;

  const [range, setRange] = useState([minPrice, maxPrice]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const cats = useAsync(getCategories, []);
  const products = useAsync(
    () =>
      getProducts({
        category: loai,
        q,
        sort: sortOption.api,
        page,
        limit: PAGE_SIZE,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice < MAX_PRICE ? maxPrice : undefined,
      }),
    [loai, q, sortOption.api, page, minPrice, maxPrice]
  );

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries({ trang: '', ...updates }).forEach(([k, v]) =>
      v ? params.set(k, v) : params.delete(k)
    );
    setSearchParams(params);
  };

  const commitPrice = ([lo, hi]) => updateParams({ tu: lo || '', den: hi < MAX_PRICE ? hi : '' });

  const catName = cats.data?.find((c) => c.id === loai)?.name;

  const filtersJsx = (
    <Filters
      cats={cats.data}
      loai={loai}
      range={range}
      onLoai={(val) => {
        updateParams({ loai: val });
        setDrawerOpen(false);
      }}
      onRange={setRange}
      onCommit={commitPrice}
    />
  );

  const data = products.data?.data || [];
  const meta = products.data?.meta;

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Crumbs
        items={[{ label: 'Danh mục', to: '/danh-muc' }, ...(catName ? [{ label: catName }] : [])]}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h3" component="h1">
            {q ? `Kết quả cho "${q}"` : catName || 'Tất cả sản phẩm'}
          </Typography>
          {meta && (
            <Typography color="text.secondary">{meta.total} sản phẩm</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            Bộ lọc
          </Button>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel id="sort-label">Sắp xếp</InputLabel>
            <Select
              labelId="sort-label"
              label="Sắp xếp"
              value={sortOption.v}
              onChange={(e) =>
                updateParams({ 'sap-xep': e.target.value === 'moi-nhat' ? '' : e.target.value })
              }
            >
              {SORT_OPTIONS.map((s) => (
                <MenuItem key={s.v} value={s.v}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          {filtersJsx}
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          {products.error ? (
            <ErrorBox error={products.error} />
          ) : !products.loading && data.length === 0 ? (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              text="Hãy thử đổi bộ lọc hoặc từ khóa khác."
              actionLabel="Xóa bộ lọc"
              to="/danh-muc"
            />
          ) : (
            <ProductGrid products={data} loading={products.loading} cols={3} skeletons={6} />
          )}

          {meta && meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={meta.totalPages}
                page={page}
                color="primary"
                onChange={(e, p) => updateParams({ trang: p > 1 ? String(p) : '' })}
              />
            </Box>
          )}
        </Grid>
      </Grid>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { p: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24 } }}
      >
        {filtersJsx}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={() => setDrawerOpen(false)}
        >
          Xem kết quả
        </Button>
      </Drawer>
    </Container>
  );
}
