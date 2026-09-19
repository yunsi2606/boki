'use client';

import React from 'react';
import type { FraudAlertEvent } from '@/types';
import { voiceAlertService } from '@/services/voiceAlertService';
import styles from './FraudAlertBanner.module.css';

interface FraudAlertBannerProps {
  alert: FraudAlertEvent | null;
  onDismiss: () => void;
  onInspectOrder?: (orderId: string) => void;
}

export const FraudAlertBanner: React.FC<FraudAlertBannerProps> = ({
  alert,
  onDismiss,
  onInspectOrder,
}) => {
  if (!alert) return null;

  const formatVnd = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleReplayVoice = () => {
    if (alert.voiceMessage) {
      voiceAlertService.playFraudVoiceAlert(alert.voiceMessage);
    }
  };

  const handleInspect = () => {
    if (onInspectOrder) {
      onInspectOrder(alert.orderId);
    }
    onDismiss();
  };

  return (
    <div className={styles.overlay} role="alert" aria-live="assertive">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.sirenIcon}>🚨</span>
            <div>
              <div className={styles.title}>Cảnh Báo Gian Lận Thời Gian Thực</div>
              <div className={styles.subTitle}>Fraud Detection AI vừa phát hiện giao dịch bất thường</div>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onDismiss} title="Đóng cảnh báo">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.orderRow}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Mã đơn hàng</span>
              <span className={styles.orderCode}>#{alert.orderCode}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Tổng tiền đơn</span>
              <span className={styles.amount}>{formatVnd(alert.totalAmount)}</span>
            </div>
          </div>

          <div className={styles.customerMeta}>
            {alert.isGuest ? (
              <span className={styles.guestBadge}>👤 Khách Vãng Lai (Guest)</span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Tài khoản thành viên</span>
            )}
            <span className={styles.customerName}>{alert.customerName}</span>
            {alert.customerPhone && alert.customerPhone !== '---' && (
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>• {alert.customerPhone}</span>
            )}
          </div>

          <div className={styles.riskSection}>
            <div className={styles.riskHeader}>
              <span>CHỈ SỐ ĐÁNH GIÁ RỦI RO (AI RISK EVALUATION)</span>
              <span className={styles.riskScoreBadge}>Điểm: {alert.riskScore}/100</span>
            </div>
            <ul className={styles.reasonsList}>
              {alert.riskReasons && alert.riskReasons.length > 0 ? (
                alert.riskReasons.map((reason, idx) => <li key={idx}>{reason}</li>)
              ) : (
                <li>Giao dịch giá trị cao từ tài khoản chưa được định danh đầy đủ</li>
              )}
            </ul>
          </div>

          <div className={styles.autopilotNotice}>
            <span>🤖</span>
            <span><strong>Autopilot:</strong> Đã tự động tạm giữ đơn hàng và khoanh vùng cách ly để Quản trị viên duyệt thủ công.</span>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.actionInspect} onClick={handleInspect}>
              🔍 Kiểm Tra & Xử Lý Ngay
            </button>
            <button
              type="button"
              className={styles.actionReplay}
              onClick={handleReplayVoice}
              title="Phát lại giọng nói cảnh báo"
            >
              🔊 Nghe Lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
