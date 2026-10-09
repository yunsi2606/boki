'use client';

import { useEffect, useState } from 'react';
import type { ReleaseScheduleItem, ReleaseScheduleEditionItem } from '@/types/schedule';
import ScheduleDetailEditionContent from './ScheduleDetailEditionContent';
import styles from './scheduleDetailModal.module.css';

interface ScheduleDetailModalProps {
  item: ReleaseScheduleItem | null;
  initialEditionIdx?: number;
  onClose: () => void;
}

export default function ScheduleDetailModal({
  item,
  initialEditionIdx = 0,
  onClose,
}: ScheduleDetailModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(initialEditionIdx);

  useEffect(() => {
    setSelectedIdx(initialEditionIdx || 0);
  }, [item, initialEditionIdx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const editions = item.editions && item.editions.length > 0
    ? item.editions
    : [{
        editionName: 'Bản phổ thông',
        editionType: 'STANDARD' as const,
        releaseDate: item.releaseDate,
        status: item.status,
      }];

  const currentEdition: ReleaseScheduleEditionItem = editions[selectedIdx] || editions[0];

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.headerSubtitle}>Thông tin lịch xuất bản</span>
            <h3 className={styles.modalTitle}>{item.title}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        {editions.length > 1 && (
          <div className={styles.editionTabsBar}>
            {editions.map((ed, idx) => (
              <button
                key={ed.id || idx}
                type="button"
                className={`${styles.modalEditionTab} ${selectedIdx === idx ? styles.modalEditionTabActive : ''}`}
                onClick={() => setSelectedIdx(idx)}
              >
                {ed.editionName}
              </button>
            ))}
          </div>
        )}

        <ScheduleDetailEditionContent
          item={item}
          currentEdition={currentEdition}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
