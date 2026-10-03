import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import type { OrphanFile } from '@/types/storage';
import { formatDate } from '@/types/storage';
import styles from './storageModal.module.css';

interface DeleteSingleOrphanModalProps {
  file: OrphanFile | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (key: string) => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteSingleOrphanModal({
  file,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteSingleOrphanModalProps) {
  if (!isOpen || !file) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.iconCircleDanger}>
              <Trash2 size={20} />
            </div>
            <h3 className={styles.title}>Xóa tệp mồ côi</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={isDeleting}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.warningBox}>
            <AlertTriangle size={18} className={styles.warningIcon} />
            <div>
              <strong>Cảnh báo xóa vĩnh viễn:</strong> Tệp này sẽ bị xóa khỏi bộ nhớ lưu trữ Cloudflare R2 và không thể khôi phục.
            </div>
          </div>

          <div className={styles.filePreviewCard}>
            <img
              src={file.url}
              alt={file.key}
              className={styles.previewThumb}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder-book.png';
              }}
            />
            <div className={styles.fileMeta}>
              <div className={styles.fileKey} title={file.key}>
                {file.key}
              </div>
              <div className={styles.fileInfo}>
                Dung lượng: <strong>{file.sizeFormatted}</strong> • Tải lên: {formatDate(file.lastModified)}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Hệ thống đã xác nhận tệp này không còn được liên kết với bất kỳ Sách, Danh mục, Blog hoặc Ảnh đại diện người dùng nào trong cơ sở dữ liệu.
          </p>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={() => onConfirm(file.key)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className={styles.spinning} />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Xóa vĩnh viễn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
