'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { communityService, MangaComment } from '@/services/communityService';
import styles from './volumeDiscussionSection.module.css';

interface Props {
  bookTitle: string;
  bookSlug: string;
}

export function VolumeDiscussionSection({ bookTitle, bookSlug }: Props) {
  const { user, isAuthenticated, redirectToLogin, hasPurchased } = useAuth();
  const [comments, setComments] = useState<MangaComment[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const list = communityService.getComments(bookSlug);
    setComments(list);
  }, [bookSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    const isVerified = hasPurchased(bookSlug);
    const newComment = communityService.addComment({
      bookTitle,
      bookSlug,
      authorName: user?.displayName || 'Độc giả Boki',
      authorAvatarColor: '#EE4D2D',
      content: commentText.trim(),
      isVerifiedBuyer: isVerified,
    });

    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
  };

  return (
    <section className={styles.section} id="comments" aria-label="Bình luận và cảm nhận độc giả">
      <div className={styles.header}>
        <h3 className={styles.title}>Bình Luận & Cảm Nhận Độc Giả</h3>
        <span className={styles.countBadge}>{comments.length} bình luận</span>
      </div>

      {/* Comment Form */}
      <div className={styles.formContainer}>
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className={styles.commentForm}>
            <div className={styles.userBanner}>
              <span className={styles.authorLabel}>
                Bình luận dưới tên <strong>{user?.displayName}</strong>
              </span>
              {hasPurchased(bookSlug) && (
                <span className={styles.verifiedBadge}>Đã mua chính hãng</span>
              )}
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Chia sẻ cảm nhận, chất lượng in ấn hoặc dịch thuật của ${bookTitle}...`}
              className={styles.textarea}
              rows={3}
              required
            />
            <div className={styles.formFooter}>
              <span className={styles.hint}>Văn minh, lịch sự, tôn trọng bản quyền</span>
              <button type="submit" className={styles.submitBtn}>
                Gửi bình luận
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <p>Đăng nhập tài khoản Boki để tham gia thảo luận và đánh giá tác phẩm này</p>
            <button type="button" onClick={() => redirectToLogin()} className={styles.loginBtn}>
              Đăng nhập qua Boki Store
            </button>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className={styles.commentList}>
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className={styles.commentCard}>
              <div
                className={styles.avatar}
                style={{ backgroundColor: c.authorAvatarColor || '#EE4D2D' }}
              >
                {c.authorName.charAt(0)}
              </div>
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{c.authorName}</span>
                    {c.isVerifiedBuyer && (
                      <span className={styles.verifiedBadge}>Đã mua chính hãng</span>
                    )}
                  </div>
                  <span className={styles.timeLabel}>{c.createdAt}</span>
                </div>
                <p className={styles.commentContent}>{c.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            Chưa có bình luận nào cho tập này. Hãy là người đầu tiên chia sẻ cảm nhận!
          </div>
        )}
      </div>
    </section>
  );
}
