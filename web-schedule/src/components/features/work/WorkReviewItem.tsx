'use client';

import React from 'react';
import type { WorkReview } from '@/services/workReviewService';
import styles from './workReviewItem.module.css';

interface Props {
  review: WorkReview;
  onLike: (id: string) => void;
}

export function WorkReviewItem({ review, onLike }: Props) {
  return (
    <div className={styles.reviewItem}>
      <div
        className={styles.avatar}
        style={{ backgroundColor: review.authorAvatarColor || '#EE4D2D' }}
      >
        {review.authorName.charAt(0).toUpperCase()}
      </div>

      <div className={styles.reviewBody}>
        <div className={styles.reviewHeader}>
          <span className={styles.reviewerName}>{review.authorName}</span>
          <div className={styles.reviewStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`${styles.reviewStar} ${s <= review.rating ? styles.reviewStarActive : ''}`}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className={styles.reviewDate}>{review.createdAt}</span>
        </div>

        <p className={styles.reviewContent}>{review.content}</p>

        <div className={styles.reviewFooter}>
          <button
            type="button"
            onClick={() => onLike(review.id)}
            className={styles.likeBtn}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span>{review.likes > 0 ? `Hữu ích (${review.likes})` : 'Hữu ích'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
