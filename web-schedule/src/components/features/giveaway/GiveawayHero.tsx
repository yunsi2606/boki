'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GiveawayCampaignDetail } from '@/types/giveaway';
import styles from './giveawayHero.module.css';

interface Props {
  campaign: GiveawayCampaignDetail;
}

export function GiveawayHero({ campaign }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  useEffect(() => {
    const target = new Date(campaign.endDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ d, h, m, s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [campaign.endDate]);

  const isOpen = campaign.status === 'OPEN';
  const isDrawn = campaign.status === 'DRAWN';

  return (
    <div className={styles.heroWrapper}>
      <div className={styles.bannerBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={campaign.bannerUrl || '/brand/giveaway-default.jpg'}
          alt={campaign.title}
          className={styles.bannerImg}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80';
          }}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.badgeRow}>
          {isOpen && <span className={`${styles.statusBadge} ${styles.open}`}>Đang diễn ra</span>}
          {isDrawn && <span className={`${styles.statusBadge} ${styles.drawn}`}>Đã có kết quả</span>}
          {!isOpen && !isDrawn && <span className={`${styles.statusBadge} ${styles.closed}`}>Đã kết thúc</span>}
          <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
            {campaign.totalEntriesCount} lượt tham gia
          </span>
        </div>

        <h1 className={styles.title}>{campaign.title}</h1>

        {campaign.description && <p className={styles.desc}>{campaign.description}</p>}

        {campaign.scheduleTitle && (
          <Link href={`/lich-phat-hanh`} className={styles.scheduleLinkBox}>
            Truyện phát hành liên kết: {campaign.scheduleTitle} →
          </Link>
        )}

        {isOpen && (
          <div className={styles.countdownBox}>
            <span className={styles.countdownLabel}>Thời gian tham gia còn lại:</span>
            <div className={styles.countdownDigits}>
              <div className={styles.digitBox}>
                <span className={styles.digitNum}>{timeLeft.d}</span>
                <span className={styles.digitText}>Ngày</span>
              </div>
              <div className={styles.digitBox}>
                <span className={styles.digitNum}>{timeLeft.h}</span>
                <span className={styles.digitText}>Giờ</span>
              </div>
              <div className={styles.digitBox}>
                <span className={styles.digitNum}>{timeLeft.m}</span>
                <span className={styles.digitText}>Phút</span>
              </div>
              <div className={styles.digitBox}>
                <span className={styles.digitNum}>{timeLeft.s}</span>
                <span className={styles.digitText}>Giây</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
