'use client';

import Link from 'next/link';
import { GiveawayPrize } from '@/types/giveaway';
import styles from './giveawayPrizeList.module.css';

interface Props {
  prizes: GiveawayPrize[];
  prizeStructureType?: string;
}

export function GiveawayPrizeList({ prizes, prizeStructureType }: Props) {
  if (!prizes || prizes.length === 0) return null;

  const isFlat = prizeStructureType === 'FLAT';

  const getTierBadge = (tier: string, index: number) => {
    if (isFlat) {
      return (
        <span className={`${styles.tierBadge} ${styles.tierStandard}`}>
          Phần quà #{index + 1}
        </span>
      );
    }
    switch (tier) {
      case 'FIRST':
        return <span className={`${styles.tierBadge} ${styles.tierFirst}`}>Giải Nhất</span>;
      case 'SECOND':
        return <span className={`${styles.tierBadge} ${styles.tierSecond}`}>Giải Nhì</span>;
      case 'THIRD':
        return <span className={`${styles.tierBadge} ${styles.tierThird}`}>Giải Ba</span>;
      case 'CONSOLATION':
        return <span className={`${styles.tierBadge} ${styles.tierConsolation}`}>Khuyến Khích</span>;
      default:
        return <span className={`${styles.tierBadge} ${styles.tierStandard}`}>Giải Thưởng</span>;
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>
        {isFlat ? 'Danh sách quà tặng sự kiện' : 'Cơ cấu giải thưởng'}
      </h2>
      <div className={styles.grid}>
        {prizes.map((prize, idx) => (
          <div key={prize.id || idx} className={styles.prizeCard}>
            {getTierBadge(prize.prizeTier, idx)}
            <h3 className={styles.prizeName}>{prize.prizeName}</h3>
            <span className={styles.prizeQty}>Số lượng: {prize.quantity} giải</span>

            {prize.scheduleTitle && (
              <Link href="/lich-phat-hanh" className={styles.scheduleMangaLink}>
                {prize.scheduleCoverUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={prize.scheduleCoverUrl}
                    alt={prize.scheduleTitle}
                    className={styles.scheduleCoverThumb}
                  />
                )}
                <span>Truyện LPH: {prize.scheduleTitle} →</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
