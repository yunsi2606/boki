'use client';

import React from 'react';
import Link from 'next/link';
import { ReleaseScheduleItem } from '@/types/schedule';
import styles from './homePopularitySection.module.css';

interface Props {
  schedules?: ReleaseScheduleItem[];
  loading?: boolean;
}

function formatMetric(n?: number): string {
  if (!n || n <= 0) return '0';
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return n.toLocaleString('vi-VN');
}

export function HomePopularitySection({ schedules = [], loading = false }: Props) {
  // Sort by real popularity metrics (views + 2 * likes) and take top 5
  const topItems = [...schedules]
    .sort((a, b) => {
      const scoreA = (a.viewsCount || 0) + (a.likesCount || 0) * 2;
      const scoreB = (b.viewsCount || 0) + (b.likesCount || 0) * 2;
      return scoreB - scoreA;
    })
    .slice(0, 5);

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
          <span className={styles.headerSub}>Quan tâm nhiều nhất</span>
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
            const detailUrl = `/tap-truyen/${encodeURIComponent(item.slug || item.id)}`;

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

                {/* Details with 4 metrics: rating, views, likes, comments */}
                <div className={styles.infoCol}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <div className={styles.metaRow}>
                    <span className={styles.pubTag}>{item.publisher}</span>
                    <span
                      className={styles.ratingBadge}
                      title={`Đánh giá: ${(item.rating || 5.0).toFixed(1)}/5 sao`}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>{(item.rating || 5.0).toFixed(1)}</span>
                    </span>
                  </div>

                  {/* 3 Metric badges: Views • Likes • Comments */}
                  <div className={styles.statsRow}>
                    <span className={styles.statItem} title={`${item.viewsCount || 0} lượt xem`}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>{formatMetric(item.viewsCount)}</span>
                    </span>

                    <span className={styles.statItem} title={`${item.likesCount || 0} lượt yêu thích`}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={styles.heartIcon}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span>{formatMetric(item.likesCount)}</span>
                    </span>

                    <span className={styles.statItem} title={`${item.reviewsCount || 0} bình luận`}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>{formatMetric(item.reviewsCount)}</span>
                    </span>
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
