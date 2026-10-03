import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, X, Loader2 } from 'lucide-react';
import styles from './storageModal.module.css';

interface CleanAllOrphansModalProps {
  orphanCount: number;
  orphanSizeFormatted: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isCleaning: boolean;
}

export default function CleanAllOrphansModal({
  orphanCount,
  orphanSizeFormatted,
  isOpen,
  onClose,
  onConfirm,
  isCleaning,
}: CleanAllOrphansModalProps) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'DỌN RÁC';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.iconCircleDanger}>
              <Trash2 size={20} />
            </div>
            <h3 className={styles.title}>Dọn dẹp toàn bộ tệp rác</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={isCleaning}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.warningBox}>
            <AlertTriangle size={20} className={styles.warningIcon} />
            <div>
              <strong>Cảnh báo hành động hàng loạt:</strong> Thao tác này sẽ xóa vĩnh viễn{' '}
              <strong>{orphanCount} tệp</strong> mồ côi với tổng dung lượng{' '}
              <strong>{orphanSizeFormatted}</strong> khỏi Cloudflare R2.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '13px',
              color: '#166534',
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Cơ chế bảo vệ 2 giờ:</strong> Các tệp mới tải lên trong vòng 2 giờ qua được tự động giữ lại để tránh xóa nhầm ảnh đang soạn thảo chưa lưu.
            </div>
          </div>

          <div className={styles.confirmInputGroup}>
            <label className={styles.confirmLabel}>
              Nhập chữ <strong>DỌN RÁC</strong> vào ô dưới để xác nhận xóa:
            </label>
            <input
              type="text"
              className={styles.confirmInput}
              placeholder="Nhập DỌN RÁC để tiếp tục"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isCleaning}
              autoFocus
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isCleaning}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={onConfirm}
            disabled={!isConfirmed || isCleaning}
          >
            {isCleaning ? (
              <>
                <Loader2 size={16} className={styles.spinning} />
                <span>Đang dọn dẹp...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Xác nhận dọn dẹp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
