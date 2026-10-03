'use client';

import styles from './FlashSaleProgressBar.module.css';

interface FlashSaleProgressBarProps {
  soldQuantity: number;
  quantityLimit: number;
}

export default function FlashSaleProgressBar({
  soldQuantity,
  quantityLimit,
}: FlashSaleProgressBarProps) {
  const isSoldOut = soldQuantity >= quantityLimit;
  const remaining = Math.max(0, quantityLimit - soldQuantity);
  const percentage = quantityLimit > 0
    ? Math.min(100, Math.round((soldQuantity / quantityLimit) * 100))
    : 0;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${isSoldOut ? styles.fillSoldOut : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={styles.textRow}>
        {isSoldOut ? (
          <span className={styles.soldOutBadge}>Hết suất Flash Sale</span>
        ) : remaining <= 3 ? (
          <span className={styles.urgencyText}>Chỉ còn {remaining} cuốn!</span>
        ) : (
          <span className={styles.soldText}>
            Đã bán {soldQuantity} / {quantityLimit}
          </span>
        )}
      </div>
    </div>
  );
}
