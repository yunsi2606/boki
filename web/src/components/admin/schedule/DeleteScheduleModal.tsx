'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import type { ReleaseScheduleItem } from '@/types/schedule';
import styles from './deleteScheduleModal.module.css';

interface DeleteScheduleModalProps {
  isOpen: boolean;
  item: ReleaseScheduleItem | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteScheduleModal({
  isOpen,
  item,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteScheduleModalProps) {
  if (!isOpen || !item || typeof document === 'undefined') return null;

  const editionsCount = item.editions ? item.editions.length : 0;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.warningIconBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className={styles.title}>Xác nhận xóa mục lịch</h3>
              <p className={styles.subtitle}>Thao tác không thể hoàn tác</p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={isDeleting}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p>
            Bạn có chắc chắn muốn xóa đầu sách này khỏi danh mục lịch phát hành?
          </p>

          <div className={styles.itemCard}>
            <div className={styles.itemTitle}>{item.title}</div>
            <div className={styles.itemMeta}>
              Nhà xuất bản: <strong>{item.publisher}</strong> | Ngày phát hành: {item.releaseDate}
            </div>
            {editionsCount > 0 && (
              <div className={styles.itemMeta}>
                Số lượng phiên bản liên quan sẽ bị xóa: <strong>{editionsCount} phiên bản</strong>
              </div>
            )}
          </div>

          <div className={styles.safeNotice}>
            <strong>Lưu ý bảo vệ dữ liệu sách:</strong> Thao tác này chỉ xóa bản ghi trong lịch phát hành và các phiên bản dự kiến. Các sản phẩm sách đã liên kết trên sàn Boki vẫn được giữ nguyên vẹn 100%.
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={() => onConfirm(item.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
