'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, Check, Loader2 } from 'lucide-react';
import { chatService } from '@/services/chatService';
import styles from './adminConfirmationModal.module.css';

export interface ConfirmationPayload {
  ticketId: string;
  actionType: string;
  actionName?: string;
  orderId?: string;
  orderCode?: string;
  totalAmount?: number;
  details?: Record<string, unknown>;
}

interface AdminConfirmationModalProps {
  payload: ConfirmationPayload;
  onClose: () => void;
  onComplete: (success: boolean, message: string) => void;
}

export default function AdminConfirmationModal({
  payload,
  onClose,
  onComplete,
}: AdminConfirmationModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAction = async (confirmed: boolean) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await chatService.confirmAdminAction(payload.ticketId, confirmed);
      const isSuccess = response?.success ?? confirmed;
      const msg = response?.message || (confirmed ? 'Thao tác đã được thực thi thành công.' : 'Đã huỷ thao tác.');
      onComplete(isSuccess, msg);
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý vé xác thực.';
      setErrorMessage(errorText);
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ShieldAlert size={18} className={styles.warningIcon} />
            <span>Xác nhận thao tác quản trị</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={submitting}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.warningBanner}>
            <ShieldAlert size={18} className={styles.warningIcon} />
            <div>
              Thao tác này sẽ trực tiếp tác động lên cơ sở dữ liệu hệ thống. Vui lòng xác thực thông tin đối tượng trước khi phê duyệt.
            </div>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Mã vé xác thực:</span>
              <span className={styles.ticketBadge}>{payload.ticketId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Loại hành động:</span>
              <span className={styles.detailValue}>{payload.actionName || payload.actionType}</span>
            </div>
            {payload.orderCode && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Mã đơn hàng:</span>
                <span className={styles.detailValue}>{payload.orderCode}</span>
              </div>
            )}
            {payload.orderId && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Order UUID:</span>
                <span className={styles.detailValue} style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                  {payload.orderId}
                </span>
              </div>
            )}
            {payload.totalAmount !== undefined && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Giá trị đơn:</span>
                <span className={styles.detailValue} style={{ color: '#38bdf8' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payload.totalAmount)}
                </span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div style={{ color: '#ef4444', fontSize: '12px', padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
              {errorMessage}
            </div>
          )}

          <label className={styles.acknowledgement}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={submitting}
            />
            <span>
              Tôi đã kiểm tra kỹ lưỡng và xác nhận chịu trách nhiệm về tính chính xác của thao tác này.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => handleAction(false)}
            disabled={submitting}
          >
            Từ chối / Huỷ bỏ
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={() => handleAction(true)}
            disabled={!acknowledged || submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Phê duyệt thực thi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
