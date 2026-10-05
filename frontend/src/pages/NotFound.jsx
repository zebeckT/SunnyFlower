import Container from '@mui/material/Container';
import { EmptyState } from '../components/PageBits';

export default function NotFound() {
  return (
    <Container>
      <EmptyState
        title="Không tìm thấy trang"
        text="Trang bạn tìm không tồn tại hoặc đã được di chuyển."
        actionLabel="Về trang chủ"
        to="/"
      />
    </Container>
  );
}
