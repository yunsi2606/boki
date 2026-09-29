'use client';

import React from 'react';
import { TrendingDown } from 'lucide-react';
import styles from './adminComboCreateModal.module.css';

interface Props {
  originalTotal: number;
  comboPrice: number;
  savingsAmount: number;
  savingsPercent: number;
}

export default function ComboSavingsSummary({
  originalTotal,
  comboPrice,
  savingsAmount,
  savingsPercent,
}: Props) {
  if (originalTotal <= 0) return null;

  return (
    <div className={styles.calcCard}>
      <div className={styles.calcRow}>
        <span className={styles.calcLabel}>Tổng giá gốc nếu mua lẻ:</span>
        <span className={styles.calcValue}>{originalTotal.toLocaleString('vi-VN')}đ</span>
      </div>
      <div className={styles.calcRow}>
        <span className={styles.calcLabel}>Giá combo:</span>
        <span className={styles.calcValue}>{comboPrice.toLocaleString('vi-VN')}đ</span>
      </div>
      {savingsAmount > 0 && (
        <div className={styles.calcSavings}>
          <span style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 600 }}>
            Khách hàng tiết kiệm:
          </span>
          <span className={styles.savingsTag}>
            <TrendingDown size={16} />
            {savingsAmount.toLocaleString('vi-VN')}đ (-{savingsPercent}%)
          </span>
        </div>
      )}
    </div>
  );
}
