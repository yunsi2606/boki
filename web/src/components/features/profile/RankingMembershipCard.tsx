'use client';

import React from 'react';
import type { MemberRanking } from '@/types/profile';
import { CrownIcon, ClockIcon, SparklesIcon, CheckCircleIcon } from '@/components/ui/LineIcons';
import styles from './profile.module.css';

interface RankingMembershipCardProps {
  ranking: MemberRanking;
  userName: string;
}

export default function RankingMembershipCard({ ranking, userName }: RankingMembershipCardProps) {
  const tier = ranking.currentTier.toUpperCase();

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.rankingCardWrapper}>
      <div className={styles.cardSectionHeader}>
        <h2 className={styles.cardSectionTitle}>
          <CrownIcon size={22} color="#ca8a04" />
          <span>Hạng Thành Viên & Đặc Quyền</span>
        </h2>
      </div>

      {/* Realistic VIP Card Visual */}
      <div className={`${styles.vipCardContainer} ${styles[`vipCard_${tier}`] || styles.vipCard_STANDARD}`}>
        <div className={styles.vipCardTop}>
          <div className={styles.vipLogo}>
            <CrownIcon size={20} color="#ffffff" />
            <span>BOKI VIP CLUB</span>
          </div>
          <div className={styles.vipChip} />
        </div>

        <div className={styles.vipCardMiddle}>
          <div className={styles.vipTierName}>{ranking.displayName}</div>
          <div className={styles.vipDiscountPill}>
            Đặc quyền giảm {ranking.discountPercent}% cho mọi đơn hàng
          </div>
        </div>

        <div className={styles.vipCardBottom}>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '0.5px' }}>CHỦ THẺ</div>
            <div className={styles.vipCardHolder}>{userName || 'BOKI CUSTOMER'}</div>
          </div>
          <div className={styles.vipCardExpiry}>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>CHU KỲ DUY TRÌ HẠNG</div>
            <div>
              {ranking.currentTier === 'STANDARD'
                ? 'Hạn Vĩnh Viễn'
                : `Hạn đến ${formatDate(ranking.tierExpiresAt)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Expiry / Days Remaining Notification */}
      {ranking.currentTier !== 'STANDARD' && (
        <div className={styles.expiryBanner}>
          <ClockIcon size={18} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>
            Chu kỳ xếp hạng hiện tại còn <strong>{ranking.daysRemaining} ngày</strong> (tính đến ngày <strong>{formatDate(ranking.tierExpiresAt)}</strong>). Hãy tiếp tục mua sắm để duy trì hoặc thăng cấp hạng VIP!
          </span>
        </div>
      )}

      {/* Progress Bar to Next Tier */}
      {ranking.nextTier && ranking.nextTierThreshold && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>Tiến độ thăng hạng: {ranking.nextTierDisplayName}</span>
            <span>{Math.round(ranking.progressPercent)}%</span>
          </div>

          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${Math.min(100, Math.max(0, ranking.progressPercent))}%` }}
            />
          </div>

          <div className={styles.progressFooter}>
            <span>Đã chi chu kỳ: <strong>{formatPrice(ranking.cycleSpent)}</strong></span>
            <span>
              {ranking.spentNeededForNextTier && ranking.spentNeededForNextTier > 0 ? (
                <>Cần thêm: <strong style={{ color: '#ff4d4f' }}>{formatPrice(ranking.spentNeededForNextTier)}</strong></>
              ) : (
                <strong style={{ color: '#16a34a' }}>Đã đạt mốc thăng hạng!</strong>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Tier Roadmap & Benefits */}
      <h3 className={styles.roadmapTitle}>Lộ trình & Đặc quyền thăng hạng Boki VIP</h3>
      <div className={styles.roadmapList}>
        {ranking.tiersRoadmap.map((b) => (
          <div
            key={b.level}
            className={`${styles.roadmapItem} ${b.isAchieved ? styles.roadmapItemActive : ''} ${b.isCurrent ? styles.roadmapItemCurrent : ''}`}
          >
            <div className={styles.roadmapItemLeft}>
              {b.isCurrent ? (
                <CrownIcon size={20} color="#ca8a04" />
              ) : b.isAchieved ? (
                <CheckCircleIcon size={20} color="#16a34a" />
              ) : (
                <SparklesIcon size={20} color="#94a3b8" />
              )}
              <div>
                <div className={styles.roadmapItemName}>
                  {b.displayName} {b.isCurrent && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 800 }}>(Hạng Hiện Tại)</span>}
                </div>
                <div className={styles.roadmapItemThreshold}>
                  {b.minSpentThreshold === 0 ? 'Mặc định' : `Từ ${formatPrice(b.minSpentThreshold)}/năm`} • {b.perks.join(', ')}
                </div>
              </div>
            </div>

            <div className={styles.roadmapItemRight}>
              <span className={styles.roadmapDiscountBadge}>
                {b.discountPercent > 0 ? `Giảm ${b.discountPercent}%` : 'Giá gốc'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
