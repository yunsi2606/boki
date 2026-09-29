'use client';

import React from 'react';
import Link from 'next/link';
import type { RecommendationBook } from '@/types/recommendation';
import { Sparkles, TrendingUp, Layers, ShoppingCart, BookOpen } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { recommendationService } from '@/services/recommendationService';
import { activityTracker } from '@/services/activityTracker';
import styles from './recommendationCard.module.css';

interface Props {
  item: RecommendationBook;
  widgetType: string;
  positionIndex?: number;
  onAddedNotification?: (msg: string) => void;
}

export default function RecommendationCard({
  item,
  widgetType,
  positionIndex = 0,
  onAddedNotification,
}: Props) {
  const { addToCart } = useCart();
  const book = item.book;

  const handleClick = () => {
    recommendationService.trackInteraction({
      sessionId: activityTracker.getSessionId(),
      bookId: book.id,
      widgetType,
      eventAction: 'CLICK',
      positionIndex,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book, 1);
    recommendationService.trackInteraction({
      sessionId: activityTracker.getSessionId(),
      bookId: book.id,
      widgetType,
      eventAction: 'ADD_TO_CART',
      positionIndex,
    });
    if (onAddedNotification) {
      onAddedNotification(`Đã thêm "${book.title}" vào giỏ hàng`);
    }
  };

  const renderReasonIcon = () => {
    if (item.reasonCode === 'SAME_AUTHOR') return <Layers size={12} />;
    if (item.reasonCode === 'TRENDING') return <TrendingUp size={12} />;
    return <Sparkles size={12} />;
  };

  const coverUrl = book.imageUrls?.[0];

  return (
    <div className={styles.card}>
      <div className={styles.badgeRow}>
        <span className={styles.reasonBadge}>
          {renderReasonIcon()}
          <span>{item.reasonLabel}</span>
        </span>
      </div>

      <Link href={`/books/${book.slug || book.id}`} onClick={handleClick} className={styles.imageWrapper}>
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>
            <BookOpen size={28} />
          </div>
        )}
      </Link>

      <div className={styles.content}>
        <Link href={`/books/${book.slug || book.id}`} onClick={handleClick} className={styles.title} title={book.title}>
          {book.title}
        </Link>
        <span className={styles.author}>{book.author}</span>

        <div className={styles.footer}>
          <div className={styles.priceArea}>
            <span className={styles.price}>{book.price?.toLocaleString('vi-VN')}đ</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className={styles.origPrice}>{book.originalPrice.toLocaleString('vi-VN')}đ</span>
            )}
          </div>

          <button
            type="button"
            className={styles.addBtn}
            onClick={handleAddToCart}
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
