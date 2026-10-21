'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './thongBaoEmail.module.css';
import { scheduleNotificationService } from '@/services/scheduleNotificationService';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    scheduleNotificationService
      .unsubscribe(token)
      .then((res) => {
        if (res.success) {
          setStatus('success');
          setMessage(res.message);
        } else {
          setStatus('error');
          setMessage(res.message);
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Lỗi khi xử lý hủy đăng ký.');
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <div className={styles.card}>
        <p className={styles.description}>Đang xử lý yêu cầu hủy nhận thông báo...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={styles.card}>
        <div className={styles.iconBoxSuccess}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className={styles.title}>Đã hủy thông báo thành công</h1>
        <p className={styles.description}>
          Bạn sẽ không còn nhận email thông báo cho mục này nữa. Bạn có thể bật lại thông báo bất kỳ lúc nào trên website Boki Schedule.
        </p>
        <Link href="/" className={styles.actionBtn}>
          Về trang chủ lịch phát hành
        </Link>
        <Link href="/tac-pham" className={styles.secondaryLink}>
          Khám phá danh sách tác phẩm
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.card}>
        <div className={styles.iconBoxError}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className={styles.title}>Không thể hủy đăng ký</h1>
        <p className={styles.description}>
          {message || 'Liên kết hủy đăng ký không hợp lệ hoặc đã hết hạn.'}
        </p>
        <Link href="/" className={styles.actionBtn}>
          Quay lại Boki Schedule
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Quản lý thông báo email</h1>
      <p className={styles.description}>
        Liên kết không chứa mã xác thực. Để cài đặt nhận thông báo phát hành truyện, hãy bấm vào nút &quot;Nhận thông báo&quot; tại trang chi tiết từng tác phẩm.
      </p>
      <Link href="/tac-pham" className={styles.actionBtn}>
        Xem danh sách tác phẩm
      </Link>
    </div>
  );
}

export default function ThongBaoEmailPage() {
  return (
    <main className={styles.pageContainer}>
      <Suspense fallback={<div className={styles.card}><p className={styles.description}>Đang tải...</p></div>}>
        <UnsubscribeContent />
      </Suspense>
    </main>
  );
}
