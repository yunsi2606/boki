'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { RecommendationBook } from '@/types/recommendation';
import { Gift } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { recommendationService } from '@/services/recommendationService';
import { activityTracker } from '@/services/activityTracker';
import RecommendationCard from './RecommendationCard';
import styles from './cartAddonsSection.module.css';

interface Props {
  onShowNotification?: (msg: string) => void;
}

export default function CartAddonsSection({ onShowNotification }: Props) {
  const { cartItems, cartTotal } = useCart();
  const [addons, setAddons] = useState<RecommendationBook[]>([]);
  const [loading, setLoading] = useState(false);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      setAddons([]);
      return;
    }

    let isMounted = true;
    const bookIds = cartItems.map((it) => it.book.id);
    const sessionId = activityTracker.getSessionId();
    setLoading(true);

    recommendationService
      .getCartAddons(bookIds, cartTotal, 4)
      .then((data) => {
        if (isMounted) {
          setAddons(data || []);
          if (!trackedRef.current && data && data.length > 0) {
            trackedRef.current = true;
            data.forEach((it, idx) => {
              recommendationService.trackInteraction({
                sessionId,
                bookId: it.book.id,
                widgetType: 'CART_ADDONS',
                eventAction: 'IMPRESSION',
                positionIndex: idx,
              });
            });
          }
        }
      })
      .catch(() => {
        if (isMounted) setAddons([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cartItems, cartTotal]);

  if (loading || addons.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Gift size={20} />
        </div>
        <div>
          <h3 className={styles.title}>Gợi Ý Mua Kèm Ưu Đãi</h3>
          <p className={styles.subtitle}>
            Các sản phẩm độc giả thường mua kèm với sản phẩm trong giỏ hàng của bạn
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {addons.map((item, idx) => (
          <RecommendationCard
            key={item.book.id}
            item={item}
            widgetType="CART_ADDONS"
            positionIndex={idx}
            onAddedNotification={onShowNotification}
          />
        ))}
      </div>
    </section>
  );
}
