'use client';

import React from 'react';
import Link from 'next/link';
import { ReleaseScheduleItem } from '@/types/schedule';
import styles from './homePopularitySection.module.css';

interface Props {
  schedules?: ReleaseScheduleItem[];
  loading?: boolean;
}

export function HomePopularitySection({ schedules = [], loading = false }: Props) {
  // Take top 5 items from real schedule data
  const topItems = schedules.slice(0, 5);

  return (
    <section className={styles.container} aria-label="Tác phẩm phổ biến">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIconBox} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div>
          <h2 className={styles.headerTitle}>Phổ Biến</h2>
          <span className={styles.headerSub}>Theo dõi nhiều nhất</span>
        </div>
      </div>

      {/* List */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.skeletonList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeletonRow}>
                <div className={styles.skeletonThumb} />
                <div className={styles.skeletonTextCol}>
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonLineMini} />
                </div>
              </div>
            ))}
          </div>
        ) : topItems.length === 0 ? (
          <div className={styles.emptyState}>Chưa có dữ liệu phổ biến</div>
        ) : (
          topItems.map((item, index) => {
            const rank = index + 1;
            const coverUrl =
              item.coverUrl ||
              item.editions?.[0]?.coverUrl ||
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300';
            const detailUrl = item.slug
              ? `/lich-phat-hanh/slug/${encodeURIComponent(item.slug)}`
              : `/lich-phat-hanh#item-${item.id}`;

            return (
              <Link
                key={item.id}
                href={detailUrl}
                className={styles.itemRow}
              >
                {/* Rank number indicator */}
                <div
                  className={`${styles.rankBadge} ${
                    rank === 1
                      ? styles.rankFirst
                      : rank === 2
                      ? styles.rankSecond
                      : rank === 3
                      ? styles.rankThird
                      : styles.rankRest
                  }`}
                >
                  #{rank}
                </div>

                {/* Manga thumbnail */}
                <div className={styles.thumbBox}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverUrl}
                    alt={item.title}
                    className={styles.thumbImg}
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className={styles.infoCol}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <div className={styles.metaRow}>
                    <span className={styles.pubTag}>{item.publisher}</span>
                    {item.releaseDate && (
                      <span className={styles.dateTag}>{item.releaseDate}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
