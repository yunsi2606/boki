'use client';

import { useState } from 'react';
import type { Voucher } from '@/types/voucher';
import styles from './VoucherSection.module.css';

interface VoucherSectionProps {
  vouchers: Voucher[];
  onShowNotification: (msg: string) => void;
}

export default function VoucherSection({ vouchers, onShowNotification }: VoucherSectionProps) {
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);

  const handleClaimVoucher = (code: string) => {
    if (!claimedVouchers.includes(code)) {
      setClaimedVouchers((prev) => [...prev, code]);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(code).catch(() => { });
      }
      onShowNotification(`Đã lưu thành công mã ${code}!`);
    }
  };

  if (!vouchers || vouchers.length === 0) {
    return null;
  }

  return (
    <section className={styles.voucherSection} id="vouchers">
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>🎟️ Mã Khuyến Mãi Đang Có</h2>
            <p className={styles.sectionSub}>Lưu ngay voucher để áp dụng khi thanh toán đơn hàng</p>
          </div>
        </div>
        <div className={styles.voucherGrid}>
          {vouchers.map((v) => {
            const isClaimed = claimedVouchers.includes(v.code);
            const limit = v.usageLimit || 1;
            const used = v.usedCount || 0;
            const progress = Math.min(100, Math.round((used / limit) * 100));
            const isUsedUp = used >= limit || !v.isActive;

            const isShipping = v.type === 'SHIPPING';
            const tagText = v.tag || (isShipping ? 'MÃ VẬN CHUYỂN' : 'GIẢM GIÁ SẢN PHẨM');
            const descText =
              v.description ||
              (v.minOrderValue > 0
                ? `Đơn tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.minOrderValue)}`
                : 'Đang có hiệu lực.');

            return (
              <div
                key={v.id}
                className={`${styles.voucherTicket} ${isUsedUp ? styles.voucherTicketUsedUp : ''}`}
              >
                <div
                  className={`${styles.ticketLeft} ${isShipping ? styles.ticketLeftShipping : styles.ticketLeftProduct
                    }`}
                >
                  {isUsedUp && <div className={styles.stampUsedUp}>HẾT MÃ</div>}
                  <span className={styles.ticketLeftTag}>{tagText}</span>
                </div>

                <div className={styles.ticketRight}>
                  <h4 className={styles.voucherTitle}>{v.title}</h4>
                  <p className={styles.voucherDesc}>
                    {descText} • Đã dùng {progress}%
                  </p>
                  <div className={styles.progressBarWrapper}>
                    <div
                      className={`${styles.progressBarFill} ${isUsedUp ? styles.progressBarFillUsedUp : ''
                        }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className={styles.ticketActions}>
                    <span className={styles.voucherCodeBadge}>{v.code}</span>
                    <button
                      onClick={() => handleClaimVoucher(v.code)}
                      disabled={isUsedUp || isClaimed}
                      className={styles.claimBtn}
                    >
                      {isClaimed ? 'Đã Lưu' : isUsedUp ? 'Hết Hạn' : 'Lưu Mã'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
