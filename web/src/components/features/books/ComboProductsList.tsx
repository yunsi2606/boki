'use client';

import React from 'react';
import Link from 'next/link';
import type { ComboItem } from '@/types';
import { Layers, ArrowUpRight, BookOpen, PackageCheck } from 'lucide-react';
import styles from './comboProductsList.module.css';

interface Props {
  comboItems?: ComboItem[];
}

export default function ComboProductsList({ comboItems }: Props) {
  if (!comboItems || comboItems.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <PackageCheck size={22} className={styles.titleIcon} />
          <h2 className={styles.title}>Sản phẩm trong Combo này</h2>
          <span className={styles.countBadge}>{comboItems.length} sản phẩm</span>
        </div>
        <p className={styles.subtitle}>
          Bạn cũng có thể xem và đặt mua lẻ từng sản phẩm nếu muốn
        </p>
      </div>

      <div className={styles.grid}>
        {comboItems.map((item, index) => {
          const detailUrl = item.variantId
            ? `/books/${item.slug}?variant=${item.variantId}`
            : `/books/${item.slug}`;

          return (
            <div key={item.id || `${item.singleBookId}_${index}`} className={styles.itemCard}>
              <div className={styles.itemMain}>
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className={styles.cover}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>
                    <BookOpen size={20} />
                  </div>
                )}

                <div className={styles.info}>
                  <div className={styles.itemTitle}>
                    <span>{item.title}</span>
                    {item.variantName && (
                      <span className={styles.variantBadge}>
                        <Layers size={12} />
                        {item.variantName}
                      </span>
                    )}
                  </div>
                  <div className={styles.metaRow}>
                    <span>{item.author}</span>
                    <span>•</span>
                    <span className={styles.price}>
                      {item.price?.toLocaleString('vi-VN')}đ / sp
                    </span>
                    <span>•</span>
                    <span className={styles.qtyInCombo}>x{item.quantity} trong combo</span>
                  </div>
                </div>
              </div>

              <div className={styles.actionArea}>
                <Link href={detailUrl} className={styles.viewSingleBtn}>
                  <span>Mua lẻ sản phẩm này</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
