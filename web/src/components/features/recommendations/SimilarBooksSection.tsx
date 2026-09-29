'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { RecommendationBook } from '@/types/recommendation';
import { BookOpen } from 'lucide-react';
import { recommendationService } from '@/services/recommendationService';
import { activityTracker } from '@/services/activityTracker';
import RecommendationCard from './RecommendationCard';
import styles from './similarBooksSection.module.css';

interface Props {
  bookIdOrSlug: string;
  onShowNotification?: (msg: string) => void;
}

export default function SimilarBooksSection({ bookIdOrSlug, onShowNotification }: Props) {
  const [items, setItems] = useState<RecommendationBook[]>([]);
  const [loading, setLoading] = useState(true);
  const trackedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const sessionId = activityTracker.getSessionId();

    recommendationService
      .getSimilarBooks(bookIdOrSlug, 4)
      .then((data) => {
        if (isMounted) {
          setItems(data || []);
          if (!trackedRef.current && data && data.length > 0) {
            trackedRef.current = true;
            data.forEach((it, idx) => {
              recommendationService.trackInteraction({
                sessionId,
                bookId: it.book.id,
                widgetType: 'DETAIL_SIMILAR',
                eventAction: 'IMPRESSION',
                positionIndex: idx,
              });
            });
          }
        }
      })
      .catch(() => {
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookIdOrSlug]);

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconWrapper}>
            <BookOpen size={22} />
          </div>
          <h2 className={styles.title}>Sách Tương Tự Có Thể Bạn Thích</h2>
        </div>
      </div>

      <div className={styles.grid}>
        {items.map((item, idx) => (
          <RecommendationCard
            key={item.book.id}
            item={item}
            widgetType="DETAIL_SIMILAR"
            positionIndex={idx}
            onAddedNotification={onShowNotification}
          />
        ))}
      </div>
    </section>
  );
}
