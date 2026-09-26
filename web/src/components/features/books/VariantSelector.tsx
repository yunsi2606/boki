'use client';

import React from 'react';
import type { BookVariant } from '@/types';
import styles from './VariantSelector.module.css';

interface VariantSelectorProps {
  variants: BookVariant[];
  selectedVariantId: string | null;
  onSelectVariant: (variant: BookVariant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const currentVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <span className={styles.title}>
          Chọn Phân Loại Hàng:
        </span>
        <span className={styles.selectedName}>{currentVariant?.name}</span>
      </div>

      <div className={styles.pillGrid}>
        {variants.map((v) => {
          const isSelected = selectedVariantId === v.id;
          const isOutOfStock = v.stockQuantity <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={`${styles.pillBtn} ${isSelected ? styles.pillActive : ''} ${isOutOfStock ? styles.outOfStock : ''
                }`}
            >
              <div className={styles.pillHeader}>
                <span className={styles.variantName}>{v.name}</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {v.attributes?.['Tag'] && (
                    <span className={styles.badge}>{v.attributes['Tag']}</span>
                  )}
                  {v.maxOrderQuantity && v.maxOrderQuantity > 0 ? (
                    <span className={styles.limitTag}>Tối đa {v.maxOrderQuantity}/đơn</span>
                  ) : null}
                </div>
              </div>

              <div className={styles.pillPriceRow}>
                <span className={styles.price}>{formatCurrency(v.price)}</span>
                {v.originalPrice && v.originalPrice > v.price && (
                  <span className={styles.originalPrice}>{formatCurrency(v.originalPrice)}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
