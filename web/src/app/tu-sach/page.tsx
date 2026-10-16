'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mangaCollectionService } from '@/services/mangaCollectionService';
import type { UserMangaCollectionItem, MangaCollectionStats, CollectionStatus } from '@/types/mangaCollection';
import styles from './tuSach.module.css';

export default function TuSachPage() {
  const [items, setItems] = useState<UserMangaCollectionItem[]>([]);
  const [stats, setStats] = useState<MangaCollectionStats | null>(null);
  const [activeTab, setActiveTab] = useState<CollectionStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVault() {
      try {
        setLoading(true);
        const [collData, statsData] = await Promise.all([
          mangaCollectionService.getUserCollection(activeTab === 'ALL' ? undefined : activeTab),
          mangaCollectionService.getStats().catch(() => null),
        ]);
        setItems(collData || []);
        if (statsData) setStats(statsData);
      } catch (err) {
        console.error('Failed to load user collection', err);
      } finally {
        setLoading(false);
      }
    }
    loadVault();
  }, [activeTab]);

  const formatPrice = (val?: number | null) => {
    if (!val) return 'Chưa ghi nhận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getStatusText = (status: CollectionStatus) => {
    switch (status) {
      case 'OWNED': return 'Đã có';
      case 'SEEKING': return 'Đang tìm';
      case 'WISHLIST': return 'Muốn mua';
      case 'DROPPED': return 'Bỏ qua';
      default: return status;
    }
  };

  return (
    <main className={styles.container}>
      {/* Overview Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng số tập trong tủ</div>
          <div className={`${styles.statValue} ${styles.statHighlight}`}>
            {stats ? stats.ownedCount : items.length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Đang tìm săn mua</div>
          <div className={styles.statValue}>{stats?.seekingCount ?? 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Danh sách mong muốn</div>
          <div className={styles.statValue}>{stats?.wishlistCount ?? 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng chi phí đầu tư</div>
          <div className={styles.statValue}>
            {stats ? formatPrice(stats.totalSpent) : '0 đ'}
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className={styles.filterTabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          Tất cả
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'OWNED' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('OWNED')}
        >
          Đã sở hữu
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'SEEKING' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('SEEKING')}
        >
          Đang tìm mua
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'WISHLIST' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('WISHLIST')}
        >
          Wishlist
        </button>
      </div>

      {/* Collection Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-600)' }}>
          Đang tải tủ sách...
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyBox}>
          <h3>Tủ sách của bạn chưa có cuốn nào ở mục này</h3>
          <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-neutral-500)' }}>
            Hãy ghé thăm trang{' '}
            <Link href="/lich-phat-hanh" style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>
              Lịch phát hành
            </Link>{' '}
            để đánh dấu các tập truyện bạn đã sở hữu hoặc muốn mua nhé!
          </p>
        </div>
      ) : (
        <div className={styles.collectionGrid}>
          {items.map((item) => (
            <div key={item.id || item.scheduleId} className={styles.bookCard}>
              <div className={styles.coverBox}>
                {item.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverUrl} alt={item.scheduleTitle || 'Bìa sách'} className={styles.coverImg} />
                ) : null}
                <span className={styles.statusBadge}>{getStatusText(item.status)}</span>
              </div>
              <div className={styles.cardBody}>
                <h4 className={styles.bookTitle}>{item.scheduleTitle || 'Tập truyện'}</h4>
                {item.purchasePlace && (
                  <div className={styles.metaRow}>Nơi mua: <strong>{item.purchasePlace}</strong></div>
                )}
                {item.purchasePrice ? (
                  <div className={styles.priceTag}>Đã mua: {formatPrice(item.purchasePrice)}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
