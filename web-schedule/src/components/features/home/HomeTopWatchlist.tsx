'use client';

import Link from 'next/link';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './homeTopWatchlist.module.css';

interface Props {
  items: ReleaseScheduleItem[];
}

export function HomeTopWatchlist({ items }: Props) {
  // Top 5 items with simulated watch count
  const topList = (items && items.length > 0 ? items.slice(0, 5) : []).map((item, idx) => ({
    ...item,
    watchCount: 1540 - idx * 210,
    rank: idx + 1,
  }));

  if (topList.length === 0) return null;

  return (
    <div className={styles.card} aria-label="Top tác phẩm được chờ đợi nhất">
      <div className={styles.kicker}>BẢNG XẾP HẠNG</div>
      <h3 className={styles.title}>Top Được Mong Chờ Nhất</h3>

      <div className={styles.list}>
        {topList.map((item) => {
          const targetSlug = item.slug || item.id;
          const rankClass =
            item.rank === 1
              ? styles.rank1
              : item.rank === 2
              ? styles.rank2
              : item.rank === 3
              ? styles.rank3
              : '';

          return (
            <Link
              key={item.id}
              href={`/tap-truyen/${targetSlug}`}
              className={styles.item}
            >
              <div className={`${styles.rankBadge} ${rankClass}`}>
                {item.rank}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle} title={item.title}>
                  {item.title}
                </div>
                <div className={styles.itemMeta}>
                  <span>{item.publisher}</span>
                  <span>•</span>
                  <span>
                    <strong className={styles.watchlistCount}>{item.watchCount.toLocaleString()}</strong> theo dõi
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
