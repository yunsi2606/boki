'use client';

import React, { useState } from 'react';
import { Tag, Copy, Check } from 'lucide-react';
import type { VoucherCardData } from '@/types/chat';
import styles from '../styles/cards.module.css';

interface VoucherCardProps {
  vouchers: VoucherCardData[];
}

export default function VoucherCard({ vouchers }: VoucherCardProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!vouchers || vouchers.length === 0) return null;

  const handleCopy = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {vouchers.map((v) => {
        const isCopied = copiedCode === v.code;
        return (
          <div key={v.code} className={styles.voucherCard}>
            <div className={styles.voucherInfo}>
              <div className={styles.voucherCode}>
                <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {v.code}
              </div>
              <div className={styles.voucherDesc}>{v.title || v.description}</div>
              <div className={styles.voucherMeta}>
                {v.minOrderAmount && v.minOrderAmount > 0 ? (
                  <span>Đơn từ {Number(v.minOrderAmount).toLocaleString('vi-VN')} ₫</span>
                ) : (
                  <span>Không giới hạn đơn tối thiểu</span>
                )}
              </div>
            </div>

            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => handleCopy(v.code)}
            >
              {isCopied ? (
                <>
                  <Check size={13} />
                  Đã chép
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Sao chép
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
