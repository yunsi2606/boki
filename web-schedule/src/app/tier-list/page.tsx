'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { mangaTierListService } from '@/services/mangaTierListService';
import type { MangaTierListSummary } from '@/types/tierList';
import { TierListCard } from '@/components/features/tierlist/TierListCard';
import styles from './tierListHome.module.css';

export default function TierListCommunityPage() {
  const { isAuthenticated } = useAuth();
  const [topFour, setTopFour] = useState<MangaTierListSummary[]>([]);
  const [allLists, setAllLists] = useState<MangaTierListSummary[]>([]);
  const [myLists, setMyLists] = useState<MangaTierListSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'PUBLIC' | 'MY'>('PUBLIC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [top4, fullPublic] = await Promise.all([
          mangaTierListService.getTopPublicTierLists(4),
          mangaTierListService.getAllPublic(0, 30),
        ]);
        setTopFour(top4);
        setAllLists(fullPublic);

        if (isAuthenticated) {
          const my = await mangaTierListService.getMyTierLists();
          setMyLists(my);
        }
      } catch (err) {
        console.error('Failed to load community tier lists:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  const displayedLists = activeTab === 'PUBLIC' ? allLists : myLists;

  return (
    <main className={styles.container}>
      {/* Hero Header Banner */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.kicker}>CỘNG ĐỒNG BOKI</div>
          <h1 className={styles.title}>Manga Tier List Tuyển Chọn</h1>
          <p className={styles.subtitle}>
            Xếp hạng các tác phẩm manga theo thang S, A, B, C, D, E, F. Khám phá đánh giá từ cộng đồng hoặc tự sáng tạo bảng xếp hạng của bạn!
          </p>
          <div className={styles.heroActions}>
            <Link href="/tier-list/create" className={styles.createBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tạo Tier List Của Bạn</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Top 4 Public Lists Spotlight */}
      <section className={styles.topSection} aria-label="Top 4 bảng xếp hạng cộng đồng">
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionTitle}>Top 4 Bảng Xếp Hạng Nổi Bật Nhất</h2>
            <p className={styles.sectionSubtitle}>Dựa trên lượt yêu thích và tương tác thực tế từ độc giả</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {topFour.map((it, idx) => (
              <TierListCard key={it.id} item={it} rankBadge={idx + 1} />
            ))}
          </div>
        )}
      </section>

      {/* All Lists Section with Tabs */}
      <section className={styles.allSection} aria-label="Khám phá tất cả bảng xếp hạng">
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'PUBLIC' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('PUBLIC')}
          >
            Tất cả bảng công khai ({allLists.length})
          </button>
          {isAuthenticated && (
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'MY' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('MY')}
            >
              Bảng của tôi ({myLists.length})
            </button>
          )}
        </div>

        <div className={styles.grid}>
          {displayedLists.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Chưa có bảng xếp hạng nào trong danh mục này.</p>
              <Link href="/tier-list/create" className={styles.inlineCreateLink}>
                Hãy là người đầu tiên tạo bảng xếp hạng ngay!
              </Link>
            </div>
          ) : (
            displayedLists.map((it) => (
              <TierListCard key={it.id} item={it} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
