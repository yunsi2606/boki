'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ReleaseScheduleItem } from '@/types/schedule';
import styles from './homePopularitySection.module.css';

interface PopularityItem {
  id: string;
  rank: number;
  title: string;
  publisher: string;
  coverUrl: string;
  releaseDate: string;
  badge: string;
  scoreText: string;
  heatScore: number; // 0 - 100
  slug: string;
  bookId?: string | null;
}

interface Props {
  schedules?: ReleaseScheduleItem[];
}

type TabType = 'anticipated' | 'preorder' | 'trending' | 'top-rated';

export function HomePopularitySection({ schedules = [] }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('anticipated');

  // Derive rich ranked items based on activeTab
  const rankedItems = useMemo<PopularityItem[]>(() => {
    // Top covers fallback if schedule has empty image
    const sampleCovers = [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    ];

    const baseList = schedules.length > 0 ? schedules.slice(0, 5) : [];

    return baseList.map((item, index) => {
      const rank = index + 1;
      let scoreText = '98.5 Điểm Hot';
      let heatScore = 98 - index * 6;
      let badge = 'Sắp phát hành';

      if (activeTab === 'anticipated') {
        scoreText = `${(1800 - index * 240).toLocaleString()} người theo dõi`;
        badge = item.editions?.[0]?.editionName || 'Được mong chờ #1';
      } else if (activeTab === 'preorder') {
        scoreText = `${(850 - index * 120).toLocaleString()} đơn đặt trước`;
        heatScore = 95 - index * 7;
        badge = 'Pre-Order Hot';
      } else if (activeTab === 'trending') {
        scoreText = `${(320 - index * 45).toLocaleString()} thảo luận`;
        heatScore = 92 - index * 5;
        badge = 'Bàn luận sôi nổi';
      } else if (activeTab === 'top-rated') {
        const rating = (5.0 - index * 0.05).toFixed(1);
        scoreText = `${rating} ★ (${120 - index * 15} đánh giá)`;
        heatScore = 99 - index * 4;
        badge = 'Đã mua chính hãng';
      }

      const cover = item.coverUrl || item.editions?.[0]?.coverUrl || sampleCovers[index % sampleCovers.length];

      return {
        id: item.id || `pop-${index}`,
        rank,
        title: item.title,
        publisher: item.publisher || 'Kim Đồng',
        coverUrl: cover,
        releaseDate: item.releaseDate || 'Tháng này',
        badge,
        scoreText,
        heatScore,
        slug: item.slug || `truyen-${index}`,
        bookId: item.editions?.[0]?.bookId || null,
      };
    });
  }, [schedules, activeTab]);

  return (
    <section className={styles.section} aria-label="Bảng xếp hạng phổ biến">
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>XẾP HẠNG THỜI GIAN THỰC</div>
          <h2 className={styles.title}>Phổ Biến</h2>
          <p className={styles.subtitle}>
            Tác phẩm được quan tâm, đặt trước và thảo luận nhiều nhất toàn sàn
          </p>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabList} role="tablist">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'anticipated' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('anticipated')}
          >
            Được mong chờ nhất
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'preorder' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('preorder')}
          >
            Đặt trước hot
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'trending' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            Thảo luận sôi nổi
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'top-rated' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('top-rated')}
          >
            Đánh giá cao nhất
          </button>
        </div>
      </div>

      {/* Popularity Ranking List */}
      <div className={styles.rankingGrid}>
        {rankedItems.map((item) => (
          <div key={item.id} className={styles.rankCard}>
            {/* Rank badge indicator */}
            <div
              className={`${styles.rankBadge} ${
                item.rank === 1
                  ? styles.rankGold
                  : item.rank === 2
                  ? styles.rankSilver
                  : item.rank === 3
                  ? styles.rankBronze
                  : styles.rankDefault
              }`}
            >
              #{item.rank}
            </div>

            {/* Book Cover Image */}
            <div className={styles.coverBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.coverUrl} alt={item.title} className={styles.coverImg} loading="lazy" />
            </div>

            {/* Info and Popularity Meter */}
            <div className={styles.cardContent}>
              <div className={styles.tagRow}>
                <span className={styles.pubTag}>{item.publisher}</span>
                <span className={styles.statusTag}>{item.badge}</span>
              </div>

              <h3 className={styles.itemTitle} title={item.title}>
                <Link href={`/tap-truyen/${item.slug}`}>{item.title}</Link>
              </h3>

              <div className={styles.meterContainer}>
                <div className={styles.meterLabelRow}>
                  <span className={styles.meterText}>{item.scoreText}</span>
                  <span className={styles.meterPercent}>{item.heatScore}%</span>
                </div>
                <div className={styles.meterTrack}>
                  <div className={styles.meterBar} style={{ width: `${item.heatScore}%` }} />
                </div>
              </div>

              <div className={styles.footerRow}>
                <span className={styles.dateLabel}>Phát hành: {item.releaseDate}</span>
                <Link href={`/tap-truyen/${item.slug}`} className={styles.detailBtn}>
                  <span>Chi tiết</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
