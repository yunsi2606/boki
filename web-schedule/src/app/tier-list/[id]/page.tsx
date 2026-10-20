'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { mangaTierListService } from '@/services/mangaTierListService';
import type { MangaTierListDetail, TierDefinition, TierRankedMangaItem } from '@/types/tierList';
import { DEFAULT_TIERS } from '@/types/tierList';
import { TierListBoard } from '@/components/features/tierlist/TierListBoard';
import styles from './tierListDetail.module.css';

export default function TierListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isAuthenticated, redirectToLogin } = useAuth();

  const [detail, setDetail] = useState<MangaTierListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      setLoading(true);
      try {
        const data = await mangaTierListService.getTierListDetail(id);
        if (data) {
          setDetail(data);
          setLikesCount(data.likesCount || 0);
          setIsLiked(!!data.isLiked);
          mangaTierListService.recordView(id);
        }
      } catch (err) {
        console.error('Failed to load tier list detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      redirectToLogin(window.location.href);
      return;
    }
    try {
      const res = await mangaTierListService.toggleLike(id);
      setIsLiked(res.liked);
      setLikesCount((prev) => (res.liked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bảng xếp hạng này?')) return;
    try {
      await mangaTierListService.deleteTierList(id);
      router.push('/tier-list');
    } catch (err) {
      alert('Không thể xóa bảng xếp hạng.');
    }
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingState}>Đang tải bảng xếp hạng...</div>
      </main>
    );
  }

  if (!detail) {
    return (
      <main className={styles.container}>
        <div className={styles.notFound}>
          <h2>Không tìm thấy bảng xếp hạng</h2>
          <p>Bảng xếp hạng này không tồn tại hoặc đã bị xóa.</p>
          <Link href="/tier-list" className={styles.backLink}>Quay lại danh sách</Link>
        </div>
      </main>
    );
  }

  // Parse custom tiers
  let tiers: TierDefinition[] = DEFAULT_TIERS;
  if (detail.tiersConfig) {
    try {
      const parsed = JSON.parse(detail.tiersConfig);
      if (Array.isArray(parsed) && parsed.length > 0) tiers = parsed;
    } catch {}
  }

  // Group items by tierRank
  const assigned: Record<string, TierRankedMangaItem[]> = {};
  detail.items.forEach((it) => {
    if (!assigned[it.tierRank]) assigned[it.tierRank] = [];
    assigned[it.tierRank].push(it);
  });

  const isPublicVal = detail.isPublic ?? (detail as any).public ?? true;
  const isOwner = !!(detail.isOwner || (user && (user.id === detail.authorId || user.displayName === detail.authorDisplayName)));

  const handleToggleVisibility = async () => {
    if (!isOwner) return;
    const newPublic = !isPublicVal;
    try {
      const updated = await mangaTierListService.updateTierList(id, {
        title: detail.title,
        description: detail.description,
        isPublic: newPublic,
        tiersConfig: detail.tiersConfig,
        rankedItems: detail.items.map((it) => ({
          scheduleId: it.scheduleId,
          tierRank: it.tierRank,
          sortOrder: it.sortOrder,
        })),
      });
      setDetail(updated);
    } catch (err: any) {
      alert(err.message || 'Không thể đổi trạng thái hiển thị');
    }
  };

  return (
    <main className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span className={styles.separator}>/</span>
        <Link href="/tier-list">Manga Tier List</Link>
        <span className={styles.separator}>/</span>
        <span className={styles.current}>{detail.title}</span>
      </nav>

      {/* Header Info Banner */}
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{detail.title}</h1>
            {isOwner ? (
              <button
                type="button"
                className={`${styles.visibilityToggleBtn} ${isPublicVal ? styles.visibilityPublic : styles.visibilityPrivate}`}
                onClick={handleToggleVisibility}
                title="Nhấn để đổi Công khai / Riêng tư"
              >
                {isPublicVal ? 'Công khai' : 'Riêng tư'} (Đổi)
              </button>
            ) : (
              <span className={`${styles.visibilityBadge} ${isPublicVal ? styles.visibilityPublic : styles.visibilityPrivate}`}>
                {isPublicVal ? 'Công khai' : 'Riêng tư'}
              </span>
            )}
          </div>

          {detail.description && (
            <p className={styles.description}>{detail.description}</p>
          )}

          <div className={styles.metaRow}>
            <span className={styles.authorBadge}>{detail.authorHandle}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.itemCount}>{detail.totalItems} tác phẩm</span>
            <span className={styles.dot}>•</span>
            <span className={styles.statItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{detail.viewsCount} lượt xem</span>
            </span>
          </div>
        </div>

        {/* Action Buttons: Like, Share, Edit, Delete */}
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.likeBtn} ${isLiked ? styles.likeBtnActive : ''}`}
            onClick={handleToggleLike}
            title={isLiked ? 'Bỏ thích' : 'Thích bảng này'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{likesCount} Yêu thích</span>
          </button>

          <button type="button" className={styles.shareBtn} onClick={handleCopyLink}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{copySuccess ? 'Đã sao chép link' : 'Chia sẻ'}</span>
          </button>

          {isOwner && (
            <Link href={`/tier-list/create?edit=${detail.id}`} className={styles.editBtn} title="Xếp lại các bậc và tác phẩm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Xếp lại tier</span>
            </Link>
          )}

          {isOwner && (
            <button type="button" className={styles.deleteBtn} onClick={handleDelete} title="Xóa bảng này">
              Xóa
            </button>
          )}
        </div>
      </header>

      {/* Visual Tier Board */}
      <TierListBoard
        tiers={tiers}
        assigned={assigned}
        isEditable={false}
      />
    </main>
  );
}
