'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { Book } from '@/types';
import type { FrequentlyBoughtTogetherData } from '@/types/recommendation';
import { Plus, ShoppingBag, TrendingDown, Layers } from 'lucide-react';
import { recommendationService } from '@/services/recommendationService';
import { activityTracker } from '@/services/activityTracker';
import { useCart } from '@/hooks/useCart';
import styles from './frequentlyBoughtTogether.module.css';
import { getBookPriceDisplay } from '@/utils/bookPrice';

interface Props {
  bookIdOrSlug: string;
  onShowNotification?: (msg: string) => void;
}

export default function FrequentlyBoughtTogether({ bookIdOrSlug, onShowNotification }: Props) {
  const { addToCart } = useCart();
  const [data, setData] = useState<FrequentlyBoughtTogetherData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    recommendationService
      .getFrequentlyBoughtTogether(bookIdOrSlug)
      .then((res) => {
        if (isMounted && res && res.recommendedItems && res.recommendedItems.length > 0) {
          setData(res);
          const initialSet = new Set<string>();
          initialSet.add(res.mainBook.id);
          res.recommendedItems.forEach((it) => initialSet.add(it.id));
          setSelectedIds(initialSet);
        }
      })
      .catch(() => {
        if (isMounted) setData(null);
      });

    return () => {
      isMounted = false;
    };
  }, [bookIdOrSlug]);

  const allBooks = useMemo(() => {
    if (!data) return [];
    return [data.mainBook, ...data.recommendedItems];
  }, [data]);

  const { calculatedTotal, savingsAmount } = useMemo(() => {
    if (!data) return { calculatedTotal: 0, savingsAmount: 0 };
    let total = 0;
    allBooks.forEach((b) => {
      if (selectedIds.has(b.id)) {
        total += getBookPriceDisplay(b).currentPrice;
      }
    });

    const isAllSelected = selectedIds.size === allBooks.length && allBooks.length > 1;
    const savings = isAllSelected ? Math.round(total * 0.06) : 0;
    return {
      calculatedTotal: total - savings,
      savingsAmount: savings,
    };
  }, [data, allBooks, selectedIds]);

  if (!data || data.recommendedItems.length === 0) {
    return null;
  }

  const toggleBook = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddAll = () => {
    const sessionId = activityTracker.getSessionId();
    allBooks.forEach((book) => {
      if (selectedIds.has(book.id)) {
        addToCart(book, 1);
        recommendationService.trackInteraction({
          sessionId,
          bookId: book.id,
          widgetType: 'DETAIL_FREQUENTLY_BOUGHT',
          eventAction: 'ADD_TO_CART',
        });
      }
    });

    if (onShowNotification) {
      onShowNotification(`Đã thêm ${selectedIds.size} cuốn sách vào giỏ hàng`);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconWrapper}>
            <Layers size={22} />
          </div>
          <div>
            <h3 className={styles.title}>Thường Được Mua Cùng Nhau</h3>
            <p className={styles.subtitle}>
              Tiết kiệm thêm khi mua trọn bộ combo các sách thường xuyên được đặt cùng nhau
            </p>
          </div>
        </div>
      </div>

      <div className={styles.bundleLayout}>
        <div className={styles.booksRow}>
          {allBooks.map((book, index) => {
            const isSelected = selectedIds.has(book.id);
            return (
              <React.Fragment key={book.id}>
                {index > 0 && (
                  <div className={styles.plusIcon}>
                    <Plus size={20} />
                  </div>
                )}
                <div
                  className={`${styles.bookItem} ${!isSelected ? styles.disabled : ''}`}
                  onClick={() => toggleBook(book.id)}
                >
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isSelected}
                    onChange={() => toggleBook(book.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {book.imageUrls?.[0] && (
                    <img src={book.imageUrls[0]} alt={book.title} className={styles.cover} />
                  )}
                  <div className={styles.info}>
                    <div className={styles.bookTitle} title={book.title}>
                      {book.title}
                    </div>
                    <div className={styles.bookPrice}>
                      {(() => {
                        const priceInfo = getBookPriceDisplay(book);
                        return priceInfo.isRange ? priceInfo.compactDisplayPrice : `${priceInfo.currentPrice.toLocaleString('vi-VN')}đ`;
                      })()}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.priceDetails}>
            <span className={styles.totalLabel}>
              Tổng tiền ({selectedIds.size} cuốn):
            </span>
            <span className={styles.totalPrice}>
              {calculatedTotal.toLocaleString('vi-VN')}đ
            </span>
            {savingsAmount > 0 && (
              <span className={styles.savingsBadge}>
                <TrendingDown size={14} />
                Tiết kiệm {savingsAmount.toLocaleString('vi-VN')}đ (-6%)
              </span>
            )}
          </div>

          <button
            type="button"
            className={styles.buyBundleBtn}
            onClick={handleAddAll}
            disabled={selectedIds.size === 0}
          >
            <ShoppingBag size={16} />
            <span>Thêm cả {selectedIds.size} cuốn vào giỏ</span>
          </button>
        </div>
      </div>
    </section>
  );
}
