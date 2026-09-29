'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Book } from '@/types';
import { comboService } from '@/services/comboService';
import { Package, ArrowRight, TrendingDown } from 'lucide-react';
import styles from './relatedCombosSection.module.css';

interface Props {
  bookIdOrSlug: string;
}

export default function RelatedCombosSection({ bookIdOrSlug }: Props) {
  const [combos, setCombos] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    comboService
      .getCombosForBook(bookIdOrSlug)
      .then((data) => {
        if (isMounted) {
          setCombos(data || []);
        }
      })
      .catch(() => {
        if (isMounted) setCombos([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookIdOrSlug]);

  if (loading || combos.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleArea}>
            <Package size={20} className={styles.titleIcon} />
            <h3 className={styles.title}>Tiết kiệm hơn khi mua theo Combo!</h3>
          </div>
          <p className={styles.subtitle}>
            Sản phẩm này có trong các bộ combo ưu đãi dưới đây:
          </p>
        </div>
      </div>

      <div className={styles.list}>
        {combos.map((combo) => (
          <div key={combo.id} className={styles.comboCard}>
            <div className={styles.mainInfo}>
              {combo.imageUrls?.[0] && (
                <img
                  src={combo.imageUrls[0]}
                  alt={combo.title}
                  className={styles.comboCover}
                  loading="lazy"
                />
              )}
              <div className={styles.details}>
                <div className={styles.comboTitle}>{combo.title}</div>
                <div className={styles.priceRow}>
                  <span className={styles.comboPrice}>
                    {combo.price?.toLocaleString('vi-VN')}đ
                  </span>
                  {combo.originalTotalAmount && combo.originalTotalAmount > combo.price && (
                    <span className={styles.origPrice}>
                      {combo.originalTotalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                  {combo.savingsAmount && combo.savingsAmount > 0 && (
                    <span className={styles.savingsBadge}>
                      <TrendingDown size={13} />
                      Tiết kiệm {combo.savingsAmount.toLocaleString('vi-VN')}đ
                      {combo.savingsPercent ? ` (-${combo.savingsPercent}%)` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link href={`/books/${combo.slug || combo.id}`} className={styles.viewComboBtn}>
              <span>Xem Combo</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
