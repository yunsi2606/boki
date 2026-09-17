'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { paymentService } from '@/services/paymentService';
import type { PaymentInitResponse } from '@/types';
import styles from './SePayQrModal.module.css';

interface SePayQrModalProps {
  paymentData: PaymentInitResponse;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SePayQrModal({ paymentData, onClose, onSuccess }: SePayQrModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Live polling for payment status every 2.5 seconds
  useEffect(() => {
    if (isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await paymentService.getPaymentStatus(paymentData.orderId);
        if (res.paymentStatus === 'PAID') {
          setIsPaid(true);
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (err) {
        // Silent poll error
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [paymentData.orderId, isPaid, onSuccess]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <img src="/wallets/sepay.png" alt="SePay" className={styles.sepayLogo} />
            <span className={styles.title}>Thanh toán VietQR</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} title="Đóng">
            ✕
          </button>
        </div>

        {/* Content */}
        {isPaid ? (
          <div className={styles.successScreen}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.successTitle}>Thanh toán thành công!</h3>
            <p className={styles.successDesc}>
              Hệ thống đã nhận được tiền chuyển khoản qua SePay. Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị đóng gói!
            </p>
            <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
              Mã đơn hàng: #{paymentData.orderId.slice(0, 8).toUpperCase()}
            </div>
            <Link href="/orders/history" className={styles.viewOrderBtn}>
              Xem chi tiết đơn hàng &rarr;
            </Link>
          </div>
        ) : (
          <div className={styles.body}>
            {/* Live Polling Pulse */}
            <div className={styles.pulseIndicator}>
              <span className={styles.pulseDot}></span>
              <span>Đang chờ nhận tiền chuyển khoản...</span>
            </div>

            {/* Dynamic QR Code */}
            {paymentData.qrUrl && (
              <div className={styles.qrWrapper}>
                <img src={paymentData.qrUrl} alt="VietQR SePay" className={styles.qrImage} />
                <span className={styles.scanHint}>Mở App ngân hàng bất kỳ để quét mã</span>
              </div>
            )}

            {/* Transfer Details Table */}
            <div className={styles.infoTable}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Ngân hàng:</span>
                <span className={styles.value}>{paymentData.bankCode || 'MBBank'}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Số tài khoản:</span>
                <div className={styles.valueGroup}>
                  <span className={styles.value}>{paymentData.accountNumber || '0868889999'}</span>
                  <button
                    onClick={() => handleCopy(paymentData.accountNumber || '', 'acc')}
                    className={`${styles.copyBtn} ${copiedField === 'acc' ? styles.copied : ''}`}
                  >
                    {copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Chủ tài khoản:</span>
                <span className={styles.value}>{paymentData.accountName || 'CONG TY CO PHAN BOKI STORE'}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Số tiền:</span>
                <div className={styles.valueGroup}>
                  <span className={`${styles.value} ${styles.highlightAmount}`}>{formatVnd(paymentData.amount)}</span>
                  <button
                    onClick={() => handleCopy(paymentData.amount.toString(), 'amount')}
                    className={`${styles.copyBtn} ${copiedField === 'amount' ? styles.copied : ''}`}
                  >
                    {copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Nội dung chuyển:</span>
                <div className={styles.valueGroup}>
                  <span className={styles.value} style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                    {paymentData.paymentCode}
                  </span>
                  <button
                    onClick={() => handleCopy(paymentData.paymentCode, 'code')}
                    className={`${styles.copyBtn} ${copiedField === 'code' ? styles.copied : ''}`}
                  >
                    {copiedField === 'code' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            </div>

            {/* Memo Warning */}
            <div className={styles.memoWarning}>
              ⚠️ <strong>Lưu ý quan trọng:</strong> Vui lòng giữ nguyên <strong>Nội dung chuyển khoản ({paymentData.paymentCode})</strong> để hệ thống tự động nhận diện và kích hoạt đơn hàng trong 3-5 giây.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
