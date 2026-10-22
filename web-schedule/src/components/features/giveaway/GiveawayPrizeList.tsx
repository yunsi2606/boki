'use client';

import { GiveawayPrize } from '@/types/giveaway';
import styles from './giveawayPrizeList.module.css';

interface Props {
  prizes: GiveawayPrize[];
}

export function GiveawayPrizeList({ prizes }: Props) {
  if (!prizes || prizes.length === 0) return null;

  const getTierBadge = (tier: string) => {
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
      <h2 className={styles.title}>Cơ cấu giải thưởng</h2>
      <div className={styles.grid}>
        {prizes.map((prize) => (
          <div key={prize.id} className={styles.prizeCard}>
            {getTierBadge(prize.prizeTier)}
            <h3 className={styles.prizeName}>{prize.prizeName}</h3>
            <span className={styles.prizeQty}>Số lượng: {prize.quantity} giải</span>
          </div>
        ))}
      </div>
    </div>
  );
}
