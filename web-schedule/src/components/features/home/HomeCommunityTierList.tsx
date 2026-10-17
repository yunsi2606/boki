'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MangaTrioAvatar } from './MangaTrioAvatar';
import { mangaTierListService, MangaTierListSummary } from '@/services/mangaTierListService';
import styles from './homeCommunityTierList.module.css';

export function HomeCommunityTierList() {
  const [tierLists, setTierLists] = useState<MangaTierListSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await mangaTierListService.getTopPublicTierLists(6);
        if (mounted) {
          setTierLists(data);
        }
      } catch (err) {
        console.error('Failed to load top public tier lists:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className={styles.container} aria-label="Danh sách tuyển chọn">
      {/* Widget Header with clean list icon */}
      <div className={styles.header}>
        <div className={styles.headerIconBox} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </div>
        <h2 className={styles.headerTitle}>Danh sách tuyển chọn</h2>
      </div>

      {/* List items */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.skeletonList}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonItem}>
                <div className={styles.skeletonCircle} />
                <div className={styles.skeletonTextCol}>
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonLineMini} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          tierLists.map((item) => (
            <Link
              key={item.id}
              href={`/tu-sach?tab=tier-list&id=${item.id}`}
              className={styles.itemRow}
            >
              {/* 3-slice circular avatar */}
              <MangaTrioAvatar
                covers={item.topCovers}
                size={48}
                title={item.title}
              />

              {/* Text Info Column */}
              <div className={styles.itemInfo}>
                <h3 className={styles.itemTitle}>{item.title}</h3>

                <div className={styles.metaRow}>
                  <span className={styles.countBadge}>
                    {item.totalItems} truyện
                  </span>
                  <span className={styles.authorHandle}>
                    {item.authorHandle}
                  </span>
                </div>

                <div className={styles.timeRow}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.clockIcon}
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{item.timeAgo}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
