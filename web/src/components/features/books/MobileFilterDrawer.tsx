'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './MobileFilterDrawer.module.css';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
  children: React.ReactNode;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  totalCount,
  children,
}: MobileFilterDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div
        className={styles.drawerContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Bộ Lọc Tìm Kiếm</span>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Đóng bộ lọc"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.drawerBody}>{children}</div>

        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.applyButton}
            onClick={onClose}
          >
            Xem {totalCount} kết quả
          </button>
        </div>
      </div>
    </div>
  );
}
