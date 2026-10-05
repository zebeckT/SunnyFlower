import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import CategoryIcon from '@mui/icons-material/Category';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import { getAdminCategories, getAdminProducts, getAdminOrders } from '../../lib/adminApi';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    categoriesCount: 0,
    productsCount: 0,
    ordersCount: 0,
    pendingOrdersCount: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [cats, prods, ordersRes] = await Promise.all([
          getAdminCategories().catch(() => []),
          getAdminProducts({ pageSize: 1 }).catch(() => ({ total: 0 })),
          getAdminOrders({ pageSize: 50 }, token).catch(() => ({ total: 0, items: [] })),
        ]);

        const categoriesCount = Array.isArray(cats) ? cats.length : 0;
        // BUG: reads prods?.total but API returns totalCount
        const productsCount = prods?.total || prods?.meta?.total || (Array.isArray(prods) ? prods.length : 0);
        const orderItems = ordersRes?.items || (Array.isArray(ordersRes) ? ordersRes : []);
        const ordersCount = ordersRes?.total || orderItems.length;
        const pendingOrdersCount = orderItems.filter((o) => o.status === 'pending').length;

        setStats({ categoriesCount, productsCount, ordersCount, pendingOrdersCount });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token]);

  const cards = [
    {
      title: 'Danh Mục Hoa',
      count: stats.categoriesCount,
      label: 'danh mục',
      icon: <CategoryIcon fontSize="large" />,
      color: '#D6457A',
      bgcolor: '#FDE7EE',
      link: '/admin/categories',
    },
    {
      title: 'Sản Phẩm Trong Kho',
      count: stats.productsCount,
      label: 'sản phẩm',
      icon: <LocalFloristIcon fontSize="large" />,
      color: '#4F9D69',
      bgcolor: '#E8F5E9',
      link: '/admin/products',
    },
    {
      title: 'Tổng Đơn Hàng',
      count: stats.ordersCount,
      label: 'đơn đã đặt',
      icon: <ShoppingBagIcon fontSize="large" />,
      color: '#3B82C4',
      bgcolor: '#E3F2FD',
      link: '/admin/orders',
    },
    {
      title: 'Đơn Chờ Xử Lý',
      count: stats.pendingOrdersCount,
      label: 'cần xác nhận',
      icon: <PendingActionsIcon fontSize="large" />,
      color: '#ED9B1F',
      bgcolor: '#FFF3E0',
      link: '/admin/orders',
    },
  ];

  return (
    <Box>
      <Card
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #FFF0F5 0%, #FFFFFF 100%)',
          border: '1px solid #F0DDE3',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          {'Xin chào, '}{user?.fullName || 'Quản trị viên'}{'! 👋'}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Chào mừng bạn đến với trang quản trị SunnyFlower. Bạn có toàn quyền quản lý danh mục hoa, sản phẩm và cập nhật trạng thái đơn hàng.
        </Typography>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
            gap: 2.5,
            mb: 4,
          }}
        >
          {cards.map((card) => (
            <Card
              key={card.title}
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
              onClick={() => navigate(card.link)}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar sx={{ bgcolor: card.bgcolor, color: card.color, width: 52, height: 52 }}>
                    {card.icon}
                  </Avatar>
                  <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                  {card.count}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                  {card.title} ({card.label})
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Lối Tắt Thao Tác Nhanh
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#FFFFFF',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Quản lý danh mục hoa
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Thêm mới hoặc chỉnh sửa các nhóm hoa: hoa cưới, sinh nhật, khai trương...
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/categories')}
            sx={{ flexShrink: 0, ml: 2 }}
          >
            Vào Danh Mục
          </Button>
        </Card>

        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#FFFFFF',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Quản lý sản phẩm hoa
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Cập nhật giá bán, số lượng hoa trong kho và danh mục tương ứng.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/products')}
            sx={{ flexShrink: 0, ml: 2 }}
          >
            Vào Sản Phẩm
          </Button>
        </Card>
      </Box>
    </Box>
  );
}
