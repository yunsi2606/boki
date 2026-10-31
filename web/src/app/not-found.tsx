'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useStoreConfig } from '@/contexts/StoreConfigContext';
import styles from './not-found.module.css';

export default function NotFound() {
  const { isRedirectToSchedule, scheduleUrl } = useStoreConfig();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <a
          href={isRedirectToSchedule ? scheduleUrl : '/'}
          style={{ display: 'inline-block', marginBottom: '16px' }}
        >
          <img
            src="/brand/logo.png"
            alt="Boki Logo"
            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
          />
        </a>
        <div className={styles.badge}>404 Error</div>
        <h1 className={styles.title}>Không Tìm Thấy Trang Hoặc Sách</h1>
        <p className={styles.subtitle}>
          Rất tiếc! Tựa sách hoặc đường dẫn bạn đang truy cập không tồn tại hoặc đã thay đổi địa chỉ.
        </p>

        <div className={styles.actions}>
          {isRedirectToSchedule ? (
            <a href={scheduleUrl}>
              <Button size="lg" variant="primary" className={styles.primaryBtn}>
                Về Lịch Phát Hành
              </Button>
            </a>
          ) : (
            <Link href="/">
              <Button size="lg" variant="primary" className={styles.primaryBtn}>
                Về Trang Chủ
              </Button>
            </Link>
          )}
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
