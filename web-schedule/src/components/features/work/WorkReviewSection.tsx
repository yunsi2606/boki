'use client';

import React, { useState, useEffect } from 'react';
import {
  workReviewService,
  WorkReview,
  WorkRatingSummary,
} from '@/services/workReviewService';
import { WorkReviewItem } from './WorkReviewItem';
import styles from './workReviewSection.module.css';

interface Props {
  seriesSlug: string;
  seriesName: string;
}

export function WorkReviewSection({ seriesSlug, seriesName }: Props) {
  const [reviews, setReviews] = useState<WorkReview[]>([]);
  const [summary, setSummary] = useState<WorkRatingSummary>({
    averageRating: 4.9,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const list = workReviewService.getReviews(seriesSlug);
    setReviews(list);
    setSummary(workReviewService.getRatingSummary(seriesSlug));
  }, [seriesSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const newRev = workReviewService.addReview(seriesSlug, authorName, rating, content);
    const updated = [newRev, ...reviews];
    setReviews(updated);
    setSummary(workReviewService.getRatingSummary(seriesSlug));
    setContent('');
    setIsSubmitting(false);
  };

  const handleLike = (id: string) => {
    const updated = workReviewService.likeReview(seriesSlug, id);
    setReviews(updated);
  };

  const totalVotes = Math.max(1, summary.totalReviews);

  return (
    <section id="danh-gia" className={styles.container}>
      <h2 className={styles.sectionTitle}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.titleIcon}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        Đánh giá & Nhận xét từ độc giả
      </h2>

      {/* Summary Score & Distribution */}
      <div className={styles.summaryCard}>
        <div className={styles.scoreBlock}>
          <span className={styles.bigScore}>{summary.averageRating.toFixed(1)}</span>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className={`${styles.star} ${s <= Math.round(summary.averageRating) ? styles.starActive : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className={styles.totalReviewsText}>
            {summary.totalReviews > 0
              ? `${summary.totalReviews} lượt đánh giá`
              : 'Dựa trên điểm trung bình'}
          </span>
        </div>

        {/* Breakdown bars */}
        <div className={styles.barsBlock}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution[stars] || 0;
            const percent = summary.totalReviews > 0 ? (count / totalVotes) * 100 : stars * 18;
            return (
              <div key={stars} className={styles.barRow}>
                <span className={styles.barLabel}>{stars} sao</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${percent}%` }} />
                </div>
                <span className={styles.barCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className={styles.reviewForm}>
        <div className={styles.formHeader}>
          <span className={styles.formTitle}>Chấm điểm & Viết cảm nhận của bạn</span>
          {/* Star selector */}
          <div className={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                className={styles.starPickerBtn}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <svg
                  className={`${styles.pickerStar} ${
                    s <= (hoverRating || rating) ? styles.pickerStarActive : ''
                  }`}
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
            <span className={styles.ratingNumber}>{rating} / 5</span>
          </div>
        </div>

        <div className={styles.formInputs}>
          <input
            type="text"
            placeholder="Tên hoặc biệt danh của bạn (tùy chọn)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className={styles.nameInput}
            maxLength={50}
          />

          <textarea
            rows={3}
            placeholder={`Chia sẻ cảm nhận của bạn về cốt truyện, nét vẽ hoặc ấn bản "${seriesName}"...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className={styles.contentTextarea}
          />
        </div>

        <div className={styles.formFooter}>
          <button type="submit" disabled={isSubmitting || !content.trim()} className={styles.submitBtn}>
            Gửi đánh giá
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <div className={styles.emptyState}>
            Hãy là người đầu tiên để lại đánh giá cho tác phẩm này!
          </div>
        ) : (
          reviews.map((r) => (
            <WorkReviewItem key={r.id} review={r} onLike={handleLike} />
          ))
        )}
      </div>
    </section>
  );
}
