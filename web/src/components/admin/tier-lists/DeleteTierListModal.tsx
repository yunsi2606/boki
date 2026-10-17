'use client';

import React from 'react';
import type { MangaTierListSummary } from '@/types/tierList';
import { AlertTriangle } from 'lucide-react';
import styles from './tierListFormModal.module.css';

interface Props {
  isOpen: boolean;
  item: MangaTierListSummary | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTierListModal({
  isOpen,
  item,
  isDeleting,
  onClose,
  onConfirm,
}: Props) {
  if (!isOpen || !item) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ color: '#E03131', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} /> Xác nhận xóa
          </h2>
        </div>

        <div style={{ padding: '20px', fontSize: '13.5px', color: '#495057', lineHeight: '1.5' }}>
          Bạn có chắc chắn muốn xóa danh sách tuyển chọn <strong>&quot;{item.title}&quot;</strong>?
          <p style={{ fontSize: '12px', color: '#868E96', marginTop: '8px' }}>
            Hành động này sẽ xóa danh sách cùng toàn bộ liên kết truyện bên trong khỏi hệ thống và trang chủ.
          </p>
        </div>

        <div className={styles.modalFooter} style={{ padding: '12px 20px' }}>
          <button type="button" onClick={onClose} disabled={isDeleting} className={styles.cancelBtn}>
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={styles.submitBtn}
            style={{ background: '#E03131' }}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa tuyển chọn'}
          </button>
        </div>
      </div>
    </div>
  );
}
