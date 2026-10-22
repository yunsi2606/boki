'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { giveawayService } from '@/services/giveawayService';
import { GiveawayCampaign } from '@/types/giveaway';
import styles from './giveawayHub.module.css';

export default function GiveawayHubPage() {
  const [campaigns, setCampaigns] = useState<GiveawayCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setLoading(true);
        const data = await giveawayService.getGiveaways(0, 50);
        setCampaigns(data.content || []);
      } catch (err) {
        console.error('Failed to load giveaways:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className={`${styles.cardStatus} ${styles.statusOpen}`}>Đang diễn ra</span>;
      case 'DRAWN':
        return <span className={`${styles.cardStatus} ${styles.statusDrawn}`}>Đã có kết quả</span>;
      case 'UPCOMING':
        return <span className={`${styles.cardStatus} ${styles.statusUpcoming}`}>Sắp diễn ra</span>;
      default:
        return <span className={`${styles.cardStatus} ${styles.statusClosed}`}>Đã kết thúc</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <span className={styles.badge}>BOKI EVENT</span>
        <h1 className={styles.title}>Manga Give Away</h1>
        <p className={styles.subtitle}>
          Thử vận may cùng các tựa truyện hot, quà tặng độc quyền từ nhà phát hành và sàn sách Boki.
          Chọn 3 con số may mắn từ 100 - 999 để rinh quà!
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${statusFilter === 'ALL' ? styles.tabActive : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          Tất cả ({campaigns.length})
        </button>
        <button
          className={`${styles.tab} ${statusFilter === 'OPEN' ? styles.tabActive : ''}`}
          onClick={() => setStatusFilter('OPEN')}
        >
          Đang diễn ra
        </button>
        <button
          className={`${styles.tab} ${statusFilter === 'DRAWN' ? styles.tabActive : ''}`}
          onClick={() => setStatusFilter('DRAWN')}
        >
          Đã có kết quả
        </button>
        <button
          className={`${styles.tab} ${statusFilter === 'UPCOMING' ? styles.tabActive : ''}`}
          onClick={() => setStatusFilter('UPCOMING')}
        >
          Sắp diễn ra
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Đang tải danh sách sự kiện Give Away...</div>
      ) : filteredCampaigns.length === 0 ? (
        <div className={styles.emptyState}>
          Chưa có sự kiện Give Away nào trong mục này. Vui lòng quay lại sau!
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCampaigns.map((item) => (
            <Link key={item.id} href={`/giveaway/${item.slug}`} className={styles.card}>
              <div className={styles.cardBanner}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.bannerUrl || '/brand/giveaway-default.jpg'}
                  alt={item.title}
                  className={styles.bannerImg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                {getStatusBadge(item.status)}
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span>Kết thúc: {formatDate(item.endDate)}</span>
                  {item.winningNumber !== undefined && item.winningNumber !== null && (
                    <span>KQ: <strong>{item.winningNumber}</strong></span>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.entriesBadge}>
                    {item.totalEntriesCount || 0} người tham gia
                  </span>
                  <span className={styles.actionBtn}>
                    {item.status === 'DRAWN' ? 'Xem kết quả' : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Tham gia ngay
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
