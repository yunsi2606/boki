'use client';

import Link from 'next/link';
import type { ReleaseScheduleItem, ReleaseScheduleEditionItem } from '@/types/schedule';
import styles from './scheduleBookCard.module.css';

interface Props {
  schedule: ReleaseScheduleItem;
  targetEditionIdx?: number;
  highlightDate?: string;
}

export function ScheduleBookCard({ schedule, targetEditionIdx = 0, highlightDate }: Props) {
  const edition: ReleaseScheduleEditionItem =
    schedule.editions?.[targetEditionIdx] || schedule.editions?.[0] || {
      editionName: 'Bản phổ thông',
      editionType: 'STANDARD',
      status: schedule.status,
    };

  const cover = edition.coverUrl || schedule.coverUrl;
  const price = edition.linkedBook?.price || edition.estimatedPrice;
  const dateStr = highlightDate || edition.releaseDate || schedule.releaseDate;
  const targetSlug = schedule.slug || schedule.id;

  return (
    <Link href={`/tap-truyen/${targetSlug}`} className={styles.card}>
      <div className={styles.coverContainer}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={schedule.title} className={styles.coverImg} loading="lazy" />
        ) : (
          <div className={styles.coverPlaceholder}>Bìa dự kiến</div>
        )}
        <div className={styles.publisherTag}>{schedule.publisher}</div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{schedule.title}</h3>
        <div className={styles.editionBadge}>{edition.editionName}</div>

        <div className={styles.priceRow}>
          <div className={styles.price}>
            {price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : 'Chưa có giá'}
          </div>
          <div className={styles.date}>{dateStr}</div>
        </div>
      </div>
    </Link>
  );
}
