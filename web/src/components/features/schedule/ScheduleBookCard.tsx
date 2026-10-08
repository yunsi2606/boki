'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './scheduleBookCard.module.css';

interface ScheduleBookCardProps {
  item: ReleaseScheduleItem;
}

export default function ScheduleBookCard({ item }: ScheduleBookCardProps) {
  const [imgError, setImgError] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getStatusText = () => {
    if (item.statusBadge === 'PREORDER') return 'Đặt trước';
    if (item.statusBadge === 'RECENT') return 'Mới phát hành';
    return 'Đã phát hành';
  };

  const getStatusClass = () => {
    if (item.statusBadge === 'PREORDER') return styles.badgePreorder;
    if (item.statusBadge === 'RECENT') return styles.badgeRecent;
    return styles.badgeReleased;
  };

  return (
    <div className={styles.card}>
      {/* Book Cover */}
      <div className={styles.coverContainer}>
        {item.coverUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.coverUrl}
            alt={item.title}
            className={styles.coverImg}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.coverFallback}>Bìa sách</div>
        )}
      </div>

      {/* Book Info */}
      <div className={styles.infoColumn}>
        <div>
          <div className={styles.topMetaRow}>
            <span className={`${styles.statusBadge} ${getStatusClass()}`}>
              {getStatusText()}
            </span>
            <span className={styles.datePill}>
              Ngày: {item.releaseDateDisplay}
            </span>
          </div>

          <Link href={`/books/${item.slug || item.id}`} className={styles.bookTitle} title={item.title}>
            {item.title}
          </Link>

          <div className={styles.authorPublisher}>
            <span>Tác giả: <strong>{item.author}</strong></span>
            {item.supplier && <span> · NXB: <strong>{item.supplier}</strong></span>}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className={styles.bottomActionRow}>
          <div className={styles.priceGroup}>
            <span className={styles.priceMain}>{formatCurrency(item.price)}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className={styles.priceOriginal}>{formatCurrency(item.originalPrice)}</span>
            )}
          </div>

          <Link href={`/books/${item.slug || item.id}`} className={styles.actionBtn}>
            {item.statusBadge === 'PREORDER' ? 'Đặt trước ngay' : 'Xem chi tiết'}
          </Link>
        </div>
      </div>
    </div>
  );
}
