'use client';

import React, { useState } from 'react';
import type { AdminOrder } from '@/services/adminService';
import styles from './CancelOrderModal.module.css';

interface CancelOrderModalProps {
  order: AdminOrder;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (orderId: string, reason: string) => Promise<void>;
}

const QUICK_REASONS = [
  'Khách hàng đổi ý / Hủy theo yêu cầu',
  'Hết hàng trong kho',
  'Không liên lạc được với khách hàng',
  'Sai địa chỉ / số điện thoại người nhận',
  'Trùng lặp đơn hàng',
];

export function CancelOrderModal({ order, isOpen, onClose, onConfirmCancel }: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(QUICK_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() ? customReason.trim() : selectedReason;
    if (!finalReason) {
      alert('Vui lòng chọn hoặc nhập lý do hủy đơn.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirmCancel(order.id, finalReason);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Có lỗi xảy ra khi hủy đơn.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.title}>
            <span>⚠️</span>
            <span>Xác Nhận Hủy Đơn Hàng #{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.alertNotice}>
            📦 <strong>Tự động hoàn kho (Restock):</strong> Khi hủy đơn này, hệ thống sẽ tự động hoàn trả lại đúng số lượng tồn kho cho các tựa sách và phân loại biến thể tương ứng.
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
              Chọn lý do hủy nhanh:
            </label>
            <div className={styles.chipsList}>
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.chipBtn} ${selectedReason === r ? styles.chipSelected : ''}`}
                  onClick={() => {
                    setSelectedReason(r);
                    setCustomReason('');
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Hoặc nhập lý do chi tiết:
            </label>
            <textarea
              className={styles.textareaField}
              placeholder="Nhập lý do hủy chi tiết nếu cần..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Đóng
            </button>
            <button type="submit" className={styles.confirmBtn} disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Xác Nhận Hủy Đơn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CancelOrderModal;

