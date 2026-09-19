'use client';

import React, { useState } from 'react';
import type { AdminOrder } from '@/services/adminService';
import { adminService } from '@/services/adminService';
import styles from './RiskAssessmentCard.module.css';

interface RiskAssessmentCardProps {
  order: AdminOrder;
  onOrderUpdated?: (updatedOrder: AdminOrder) => void;
  onRequestCancel?: () => void;
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  order,
  onOrderUpdated,
  onRequestCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const score = order.riskScore != null ? order.riskScore : 0;
  const isSuspicious = order.riskLevel === 'SUSPICIOUS' || Boolean(order.isFlagged);
  const isWarning = order.riskLevel === 'WARNING';

  const getScoreColor = () => {
    if (score >= 60) return '#ef4444';
    if (score >= 35) return '#f59e0b';
    return '#10b981';
  };

  const handleDismissFlag = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn DUYỆT THỦ CÔNG và GỠ CỜ CẢNH BÁO cho đơn hàng này không?')) {
      return;
    }
    try {
      setLoading(true);
      const updated = await adminService.dismissFraudFlag(
        order.id,
        'Quản trị viên đã kiểm tra thông tin khách hàng và phê duyệt thủ công'
      );
      if (onOrderUpdated) {
        onOrderUpdated(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gỡ cờ rủi ro';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${isSuspicious ? styles.containerSuspicious : ''}`}>
      <div className={`${styles.header} ${isSuspicious ? styles.headerSuspicious : ''}`}>
        <div className={styles.headerLeft}>
          <span>Đánh Giá Rủi Ro & Fraud Detection AI</span>
        </div>
        <div>
          {isSuspicious && <span className={`${styles.badge} ${styles.badgeSuspicious}`}>🚨 Nguy Cơ Cao (Khả Nghi)</span>}
          {isWarning && !isSuspicious && <span className={`${styles.badge} ${styles.badgeWarning}`}>⚠️ Cần Lưu Ý</span>}
          {!isSuspicious && !isWarning && <span className={`${styles.badge} ${styles.badgeSafe}`}>✓ An Toàn (Safe)</span>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.meterRow}>
          <div className={styles.scoreCircle} style={{ background: getScoreColor() }}>
            <span className={styles.scoreNumber}>{score}</span>
            <span className={styles.scoreLabel}>/ 100</span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
              <span style={{ color: '#64748b' }}>Chỉ số rủi ro giao dịch</span>
              <span style={{ color: getScoreColor() }}>
                {score >= 60 ? 'Mức độ cảnh báo: NGUY CƠ GIAN LẬN CAO' : score >= 35 ? 'Mức độ: CẢNH BÁO TRUNG BÌNH' : 'Mức độ: AN TOÀN'}
              </span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${score}%`, background: getScoreColor() }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
              <span>0 (An toàn)</span>
              <span>35 (Lưu ý)</span>
              <span>60 (Ngưỡng khoanh vùng AI)</span>
              <span>100 (Rất nguy hiểm)</span>
            </div>
          </div>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Loại tài khoản đặt mua</span>
            <span className={styles.metaValue}>
              {order.isGuest ? 'Khách Vãng Lai (Guest)' : 'Tài khoản thành viên Boki'}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Hình thức thanh toán</span>
            <span className={styles.metaValue}>{order.paymentMethod || 'COD'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Trạng thái Autopilot</span>
            <span className={styles.metaValue} style={{ color: isSuspicious ? '#b91c1c' : '#15803d' }}>
              {isSuspicious ? 'Tạm dừng duyệt tự động' : 'Autopilot duyệt an toàn'}
            </span>
          </div>
        </div>

        {order.riskReasons && order.riskReasons.length > 0 && (
          <div className={styles.reasonsBox}>
            <div className={styles.reasonsTitle}>
              <span>Chi tiết các yếu tố rủi ro được AI phát hiện:</span>
            </div>
            <ul className={styles.reasonsList}>
              {order.riskReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {isSuspicious && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.approveBtn}
              onClick={handleDismissFlag}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : '✓ Duyệt Đơn Thủ Công (Bỏ qua cảnh báo)'}
            </button>
            {onRequestCancel && (
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onRequestCancel}
                disabled={loading}
              >
                ✕ Hủy / Từ Chối Đơn
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
