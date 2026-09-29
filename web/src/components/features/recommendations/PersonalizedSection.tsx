'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { RecommendationBook } from '@/types/recommendation';
import { Sparkles } from 'lucide-react';
import { recommendationService } from '@/services/recommendationService';
import { activityTracker } from '@/services/activityTracker';
import RecommendationCard from './RecommendationCard';
import styles from './personalizedSection.module.css';

interface Props {
  onShowNotification?: (msg: string) => void;
}

export default function PersonalizedSection({ onShowNotification }: Props) {
  const [items, setItems] = useState<RecommendationBook[]>([]);
  const [loading, setLoading] = useState(true);
  const trackedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const sessionId = activityTracker.getSessionId();

    recommendationService
      .getPersonalized(sessionId, 10)
      .then((data) => {
        if (isMounted) {
          setItems(data || []);
          if (!trackedRef.current && data && data.length > 0) {
            trackedRef.current = true;
            data.forEach((it, idx) => {
              recommendationService.trackInteraction({
                sessionId,
                bookId: it.book.id,
                widgetType: 'HOMEPAGE_PERSONALIZED',
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
  }, []);

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrapper}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className={styles.title}>Gợi Ý Dành Riêng Cho Bạn</h2>
            <p className={styles.subtitle}>
              Tuyển tập sách phù hợp nhất dựa trên gu đọc sách và hoạt động gần đây của bạn
            </p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {items.map((item, idx) => (
          <RecommendationCard
            key={item.book.id}
            item={item}
            widgetType="HOMEPAGE_PERSONALIZED"
            positionIndex={idx}
            onAddedNotification={onShowNotification}
          />
        ))}
      </div>
    </section>
  );
}
