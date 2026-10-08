'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './scheduleBookCard.module.css';

interface ScheduleBookCardProps {
  item: ReleaseScheduleItem;
  onOpenDetail: (item: ReleaseScheduleItem) => void;
}

export default function ScheduleBookCard({ item, onOpenDetail }: ScheduleBookCardProps) {
  const [imgError, setImgError] = useState(false);

  const formatCurrency = (val?: number) => {
    if (!val) return 'Đang cập nhật';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getEditionLabel = (type: string) => {
    switch (type) {
      case 'SPECIAL': return 'Bản đặc biệt';
      case 'LIMITED': return 'Bản giới hạn';
      case 'BOXSET': return 'Boxset';
      default: return 'Bản thường';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.coverContainer} onClick={() => onOpenDetail(item)}>
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
          <div className={styles.coverFallback}>Bìa phát hành</div>
        )}
      </div>

      <div className={styles.infoColumn}>
        <div>
          <div className={styles.topMetaRow}>
            <span className={styles.publisherBadge}>{item.publisher}</span>
            <span className={styles.editionBadge}>{getEditionLabel(item.editionType)}</span>
            <span className={styles.datePill}>{formatDate(item.releaseDate)}</span>
          </div>

          <h4 className={styles.bookTitle} onClick={() => onOpenDetail(item)} title={item.title}>
            {item.title}
          </h4>

          {item.originalTitle && (
            <p className={styles.originalTitle}>{item.originalTitle}</p>
          )}

          {item.author && (
            <div className={styles.metaRow}>
              <span>Tác giả: <strong>{item.author}</strong></span>
            </div>
          )}

          {item.gifts && (
            <div className={styles.giftsTag} title={item.gifts}>
              <span className={styles.giftsLabel}>Quà kèm:</span> {item.gifts}
            </div>
          )}
        </div>

        <div className={styles.bottomActionRow}>
          <div className={styles.priceGroup}>
            <span className={styles.priceLabel}>Giá dự kiến</span>
            <span className={styles.priceMain}>
              {formatCurrency(item.linkedBook?.price || item.estimatedPrice)}
            </span>
          </div>

          <div className={styles.actionsBtnGroup}>
            <button
              type="button"
              className={styles.detailBtn}
              onClick={() => onOpenDetail(item)}
            >
              Chi tiết
            </button>

            {item.linkedBook ? (
              <Link
                href={`/books/${item.linkedBook.slug || item.linkedBook.id}`}
                className={styles.viewProductBtn}
              >
                {item.linkedBook.isPreOrder ? 'Đặt trước' : 'Xem sản phẩm'}
              </Link>
            ) : (
              <span className={styles.notOnSaleTag}>Chờ mở bán</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
