'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { communityService, UserTierList } from '@/services/communityService';
import { CreateTierListModal } from './CreateTierListModal';
import styles from './homeCommunityTierList.module.css';

export function HomeCommunityTierList() {
  const { isAuthenticated, redirectToLogin } = useAuth();
  const [tierLists, setTierLists] = useState<UserTierList[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const lists = communityService.getPublicTierLists();
    setTierLists(lists);
    if (lists.length > 0 && !selectedId) {
      setSelectedId(lists[0].id);
    }
  }, [selectedId]);

  const activeList = tierLists.find((t) => t.id === selectedId) || tierLists[0];

  const handleLike = (id: string) => {
    const updated = communityService.likeTierList(id);
    setTierLists(updated);
  };

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreated = (newList: UserTierList) => {
    const lists = communityService.getPublicTierLists();
    setTierLists(lists);
    setSelectedId(newList.id);
  };

  return (
    <section className={styles.section} aria-label="Manga Tier List Cộng Đồng">
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>GÓC CỘNG ĐỒNG</div>
          <h2 className={styles.title}>Manga Tier List</h2>
          <p className={styles.subtitle}>
            Bảng xếp hạng công khai được cộng đồng độc giả quan tâm và bình chọn nhiều nhất
          </p>
        </div>

        <button type="button" onClick={handleOpenCreate} className={styles.createBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tạo Tier List của bạn</span>
        </button>
      </div>

      {/* Popularity Tabs / Pill Switcher */}
      <div className={styles.tabNav}>
        {tierLists.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tabBtn} ${t.id === selectedId ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedId(t.id)}
          >
            <span className={styles.tabRank}>#{idx + 1}</span>
            <span className={styles.tabTitle}>{t.title}</span>
            <span className={styles.tabLikes}>{t.likes} tim</span>
          </button>
        ))}
      </div>

      {/* Active Tier List Display */}
      {activeList && (
        <div className={styles.tierBoard}>
          <div className={styles.boardHeader}>
            <div className={styles.authorGroup}>
              <div
                className={styles.authorAvatar}
                style={{ backgroundColor: activeList.authorAvatarColor }}
              >
                {activeList.authorName.charAt(0)}
              </div>
              <div>
                <h3 className={styles.boardTitle}>{activeList.title}</h3>
                <div className={styles.boardMeta}>
                  <span>Tác giả: {activeList.authorName}</span>
                  <span className={styles.dot}>•</span>
                  <span>{activeList.createdAt}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.likeBtn}
              onClick={() => handleLike(activeList.id)}
              title="Thả tim ủng hộ bảng xếp hạng này"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{activeList.likes} Quan tâm</span>
            </button>
          </div>

          {/* Tier Rows */}
          <div className={styles.tierRows}>
            {(['S', 'A', 'B', 'C'] as const).map((tierKey) => {
              const mangaItems = activeList.tiers[tierKey] || [];
              return (
                <div key={tierKey} className={styles.tierRow}>
                  <div className={`${styles.tierLabel} ${styles[`tier_${tierKey}`]}`}>
                    <span>{tierKey}</span>
                  </div>
                  <div className={styles.tierItems}>
                    {mangaItems.length > 0 ? (
                      mangaItems.map((m) => (
                        <div key={m.title} className={styles.mangaCard} title={m.title}>
                          <div className={styles.mangaThumbBox}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.coverUrl} alt={m.title} className={styles.mangaThumb} />
                          </div>
                          <span className={styles.mangaCardTitle}>{m.title}</span>
                        </div>
                      ))
                    ) : (
                      <span className={styles.emptyNotice}>Chưa có truyện ở bậc này</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Creation Modal */}
      <CreateTierListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </section>
  );
}
