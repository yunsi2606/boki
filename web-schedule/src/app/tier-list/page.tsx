'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { mangaTierListService } from '@/services/mangaTierListService';
import type { MangaTierListSummary } from '@/types/tierList';
import { TierListCard } from '@/components/features/tierlist/TierListCard';
import styles from './tierListHome.module.css';

const PAGE_SIZE = 12;

export default function TierListCommunityPage() {
  const { isAuthenticated } = useAuth();
  const [publicLists, setPublicLists] = useState<MangaTierListSummary[]>([]);
  const [myLists, setMyLists] = useState<MangaTierListSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'PUBLIC' | 'MY'>('PUBLIC');
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      setInitialLoading(true);
      try {
        const [firstBatch, my] = await Promise.all([
          mangaTierListService.getAllPublic(0, PAGE_SIZE),
          isAuthenticated ? mangaTierListService.getMyTierLists() : Promise.resolve([]),
        ]);
        if (isMounted) {
          setPublicLists(firstBatch);
          setHasMore(firstBatch.length >= PAGE_SIZE);
          setPage(0);
          setMyLists(my);
        }
      } catch (err) {
        console.error('Failed to load initial tier lists:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Load next page
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore || activeTab !== 'PUBLIC') return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const more = await mangaTierListService.getAllPublic(nextPage, PAGE_SIZE);
      setPublicLists((prev) => [...prev, ...more]);
      setPage(nextPage);
      setHasMore(more.length >= PAGE_SIZE);
    } catch (err) {
      console.error('Failed to load more tier lists:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, activeTab]);

  // Infinite scroll observer
  useEffect(() => {
    const currentSentinel = sentinelRef.current;
    if (!currentSentinel || !hasMore || activeTab !== 'PUBLIC') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(currentSentinel);
    return () => observer.disconnect();
  }, [loadNextPage, hasMore, activeTab]);

  const displayedLists = activeTab === 'PUBLIC' ? publicLists : myLists;

  return (
    <main className={styles.container}>
      {/* Compact Header Banner */}
      <section className={styles.headerBanner}>
        <div className={styles.headerInfo}>
          <div className={styles.kicker}>CỘNG ĐỒNG BOKI</div>
          <h1 className={styles.title}>Manga Tier List Tuyển Chọn</h1>
          <p className={styles.subtitle}>
            Xếp hạng các tác phẩm manga theo thang S, A, B, C, D, E, F. Khám phá đánh giá từ cộng đồng hoặc tự sáng tạo bảng xếp hạng của bạn!
          </p>
        </div>

        <Link href="/tier-list/create" className={styles.createBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tạo Tier List Mới</span>
        </Link>
      </section>

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'PUBLIC' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('PUBLIC')}
        >
          Tất cả bảng công khai ({publicLists.length})
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

      {/* 3-Column Card Grid */}
      {initialLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : displayedLists.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Chưa có bảng xếp hạng nào trong danh mục này.</p>
          <Link href="/tier-list/create" className={styles.inlineCreateLink}>
            Hãy là người đầu tiên tạo bảng xếp hạng ngay!
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {displayedLists.map((item) => (
              <TierListCard key={item.id} item={item} />
            ))}

            {/* Skeleton loading cards when fetching more */}
            {isLoadingMore && (
              <>
                <div className={styles.skeletonCard} />
                <div className={styles.skeletonCard} />
                <div className={styles.skeletonCard} />
              </>
            )}
          </div>

          {/* Sentinel for infinite scroll */}
          {activeTab === 'PUBLIC' && <div ref={sentinelRef} className={styles.sentinel} />}

          {/* Loading indicator animation */}
          {isLoadingMore && (
            <div className={styles.loadingMoreNotice}>
              <div className={styles.loadingSpinner} />
              <span>Đang tải thêm bảng xếp hạng...</span>
            </div>
          )}

          {/* End of list text */}
          {!hasMore && activeTab === 'PUBLIC' && displayedLists.length > 0 && (
            <div className={styles.endNotice}>Bạn đã xem hết các bảng xếp hạng cộng đồng</div>
          )}
        </>
      )}
    </main>
  );
}
