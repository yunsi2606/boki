'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mangaCollectionService } from '@/services/mangaCollectionService';
import type { UserMangaCollectionItem, CollectionSummaryStats } from '@/types/mangaCollection';
import { EmailSubscriptionModal } from '@/components/features/notification/EmailSubscriptionModal';
import styles from './tuSach.module.css';

export default function UserVaultPage() {
  const [items, setItems] = useState<UserMangaCollectionItem[]>([]);
  const [stats, setStats] = useState<CollectionSummaryStats | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'OWNED' | 'WISHLIST' | 'SEEKING'>('ALL');
  const [loading, setLoading] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    async function loadVault() {
      try {
        setLoading(true);
        const [coll, statData] = await Promise.all([
          mangaCollectionService.getMyCollection(),
          mangaCollectionService.getCollectionStats().catch(() => null),
        ]);
        setItems(coll || []);
        setStats(statData);
      } catch (err) {
        console.error('Failed to load user collection', err);
      } finally {
        setLoading(false);
      }
    }
    loadVault();
  }, []);

  const filteredItems = items.filter((it) => {
    if (activeTab === 'ALL') return true;
    return it.status === activeTab;
  });

  return (
    <main className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--color-neutral-900)' }}>
          Tủ Sách Cá Nhân & Tiến Độ Sưu Tầm
        </h1>
        <button
          type="button"
          onClick={() => setIsNotifOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-neutral-700)',
            cursor: 'pointer',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span>Nhận email thông báo tủ sách</span>
        </button>
      </div>

      {stats && (
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Tổng số tập sở hữu</div>
            <div className={styles.statValue}>{stats.totalVolumes}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Tổng chi phí sưu tầm</div>
            <div className={styles.statValue}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalSpent)}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Đang tìm mua / Wishlist</div>
            <div className={styles.statValue}>{stats.wishlistCount}</div>
          </div>
        </div>
      )}

      <div className={styles.tabsRow}>
        {(['ALL', 'OWNED', 'WISHLIST', 'SEEKING'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'ALL' && 'Tất cả'}
            {tab === 'OWNED' && 'Đã sở hữu'}
            {tab === 'WISHLIST' && 'Muốn mua'}
            {tab === 'SEEKING' && 'Đang săn lùng'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-600)' }}>
          Đang tải tủ sách...
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 10, border: '1px solid var(--color-neutral-300)' }}>
          <p style={{ marginBottom: 12 }}>Chưa có sách nào trong mục này.</p>
          <Link href="/" style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>
            Khám phá Lịch phát hành ngay
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemTitle}>{item.scheduleTitle || 'Tập truyện'}</div>
              <div className={styles.itemMeta}>
                Trạng thái: <strong>{item.status === 'OWNED' ? 'Đã sở hữu' : item.status}</strong>
                {item.editionName && ` • ${item.editionName}`}
              </div>
              {item.purchasePrice && (
                <div className={styles.itemMeta}>
                  Giá mua: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.purchasePrice)}
                  {item.purchasePlace && ` tại ${item.purchasePlace}`}
                </div>
              )}
              {item.notes && <div className={styles.notes}>Ghi chú: {item.notes}</div>}
            </div>
          ))}
        </div>
      )}

      <EmailSubscriptionModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        targetName="Tủ sách & Wishlist cá nhân"
      />
    </main>
  );
}
