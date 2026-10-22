'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GiveawayCampaignDetail } from '@/types/giveaway';
import styles from './giveawayHero.module.css';

interface Props {
  campaign: GiveawayCampaignDetail;
  onOpenEntryModal?: () => void;
}

export function GiveawayHero({ campaign, onOpenEntryModal }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  const targetDate = campaign.status === 'UPCOMING' ? campaign.startDate : campaign.endDate;

  useEffect(() => {
    const target = new Date(targetDate).getTime();
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
  }, [targetDate]);

  const formatDrawDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const drawDateFormatted = formatDrawDate(campaign.drawDate || campaign.endDate);
  const isOpen = campaign.status === 'OPEN';
  const isUpcoming = campaign.status === 'UPCOMING';
  const isDrawn = campaign.status === 'DRAWN';
  const isClosed = campaign.status === 'CLOSED';

  const totalPrizeUnits = campaign.prizes?.reduce((acc, p) => acc + (p.quantity || 1), 0) || 0;

  return (
    <div className={styles.heroCard}>
      <div className={styles.dashboardGrid}>
        <div className={styles.leftCol}>
          <div className={styles.metaRow}>
            {isOpen && <span className={`${styles.statusBadge} ${styles.statusOpen}`}>Đang diễn ra</span>}
            {isUpcoming && <span className={`${styles.statusBadge} ${styles.statusUpcoming}`}>Sắp diễn ra</span>}
            {isDrawn && <span className={`${styles.statusBadge} ${styles.statusDrawn}`}>Đã có kết quả</span>}
            {isClosed && <span className={`${styles.statusBadge} ${styles.statusClosed}`}>Đã kết thúc</span>}

            <span className={styles.entriesBadge}>{campaign.totalEntriesCount} bạn đã tham gia</span>

            {campaign.scheduleTitle && (
              <Link href="/lich-phat-hanh" className={styles.scheduleLink}>
                Truyện: {campaign.scheduleTitle}
              </Link>
            )}
          </div>

          <h1 className={styles.title}>{campaign.title}</h1>

          <div className={styles.xsmbBox}>
            Kết quả sẽ được so khớp trực tiếp với 3 số cuối Giải Đặc Biệt Xổ Số Miền Bắc ngày{' '}
            <strong className={styles.xsmbHighlight}>{drawDateFormatted}</strong> (mở lúc 18:15)
          </div>

          {campaign.description && <p className={styles.desc}>{campaign.description}</p>}
        </div>

        <div className={styles.rightCol}>
          <div className={styles.prizesQuickSummary}>
            <span className={styles.summaryLabel}>Cơ cấu giải thưởng</span>
            <span className={styles.summaryVal}>
              {totalPrizeUnits} phần quà ({campaign.prizes?.length || 0} hạng giải)
            </span>
          </div>

          {(isOpen || isUpcoming) && (
            <div className={styles.countdownBox}>
              <span className={styles.countdownLabel}>
                {isOpen ? 'Thời gian nhận đăng ký còn:' : 'Thời gian mở đăng ký:'}
              </span>
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

          <div>
            {isOpen && (
              <button type="button" onClick={onOpenEntryModal} className={styles.ctaBtn}>
                Tham gia Give Away ngay
              </button>
            )}
            {isUpcoming && (
              <button type="button" disabled className={`${styles.ctaBtn} ${styles.disabledCta}`}>
                Chưa mở đăng ký
              </button>
            )}
            {isClosed && (
              <button type="button" disabled className={`${styles.ctaBtn} ${styles.disabledCta}`}>
                Chờ quay số XSMB
              </button>
            )}
            {isDrawn && (
              <a href="#winners-board" className={styles.ctaBtn}>
                Xem danh sách trúng thưởng
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
