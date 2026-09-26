import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
          <img
            src="/brand/logo.png"
            alt="Boki Logo"
            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
          />
        </Link>
        <div className={styles.badge}>404 Error</div>
        <h1 className={styles.title}>Không Tìm Thấy Trang Hoặc Sách</h1>
        <p className={styles.subtitle}>
          Rất tiếc! Tựa sách hoặc đường dẫn bạn đang truy cập không tồn tại hoặc đã thay đổi địa chỉ.
        </p>

        <div className={styles.actions}>
          <Link href="/">
            <Button size="lg" variant="primary" className={styles.primaryBtn}>
              Về Trang Chủ
            </Button>
          </Link>
          <Link href="/books">
            <Button size="lg" variant="secondary">
              Khám Phá Kho Sách
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
