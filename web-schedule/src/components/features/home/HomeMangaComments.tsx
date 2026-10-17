'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { communityService, type MangaComment } from '@/services/communityService';
import styles from './homeMangaComments.module.css';

export function HomeMangaComments() {
  const [comments, setComments] = useState<MangaComment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    setComments(communityService.getComments());
  }, []);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    const colors = ['#EE4D2D', '#FF9800', '#2B8A3E', '#1971C2', '#9C36B5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newComment = communityService.addComment({
      authorName: authorName.trim(),
      authorAvatarColor: randomColor,
      bookTitle: bookTitle.trim() || 'Thảo luận chung Manga',
      bookSlug: 'ao-ashi-tan-binh-san-co-tap-7',
      content: content.trim(),
    });

    setComments([newComment, ...comments]);
    setContent('');
  };

  return (
    <div className={styles.sectionBox} aria-label="Thảo luận cộng đồng">
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>DIỄN ĐÀN TRÒ CHUYỆN</div>
          <h2 className={styles.title}>Bình Luận & Thảo Luận Mới Nhất</h2>
        </div>
        <span className={styles.commentCountBadge}>{comments.length} bình luận</span>
      </div>

      {/* Quick Comment Input Form */}
      <form onSubmit={handlePostComment} className={styles.formBox}>
        <div className={styles.formInputs}>
          <input
            type="text"
            placeholder="Tên của bạn..."
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className={styles.nameInput}
            required
          />
          <input
            type="text"
            placeholder="Tên bộ truyện đang đọc (tùy chọn)..."
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            className={styles.bookInput}
          />
        </div>
        <textarea
          placeholder="Chia sẻ cảm nghĩ về diễn biến, chất lượng in ấn, quà tặng..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textareaInput}
          required
        />
        <button type="submit" className={styles.submitBtn}>
          <span>Gửi bình luận</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      {/* Real Comments Feed */}
      <div className={styles.commentList}>
        {comments.slice(0, 4).map((c) => (
          <div key={c.id} className={styles.commentItem}>
            <div
              className={styles.avatarCircle}
              style={{ backgroundColor: c.authorAvatarColor }}
            >
              {c.authorName.charAt(0)}
            </div>
            <div className={styles.commentBody}>
              <div className={styles.authorRow}>
                <span className={styles.authorName}>{c.authorName}</span>
                <Link href={`/tap-truyen/${c.bookSlug}`} className={styles.targetBookTag}>
                  {c.bookTitle}
                </Link>
                <span className={styles.timeAgo}>{c.createdAt}</span>
              </div>
              <p className={styles.commentText}>{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
