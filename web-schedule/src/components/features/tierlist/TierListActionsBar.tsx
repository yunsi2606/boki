'use client';

import React from 'react';
import styles from './tierListActionsBar.module.css';

interface TierListActionsBarProps {
  isPublic: boolean;
  setIsPublic: (p: boolean) => void;
  saving: boolean;
  totalAssigned: number;
  onOpenCustomModal: () => void;
  onReset: () => void;
  onSave: () => void;
}

export function TierListActionsBar({
  isPublic,
  setIsPublic,
  saving,
  totalAssigned,
  onOpenCustomModal,
  onReset,
  onSave,
}: TierListActionsBarProps) {
  return (
    <footer className={styles.bottomBar}>
      <div className={styles.barInner}>
        {/* Left: Summary Count & Settings */}
        <div className={styles.leftGroup}>
          <span className={styles.countBadge}>
            Đã xếp: <strong>{totalAssigned}</strong> truyện
          </span>
          <button type="button" className={styles.secondaryBtn} onClick={onOpenCustomModal}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Tùy biến bậc</span>
          </button>
          <button type="button" className={styles.textBtn} onClick={onReset}>
            Đặt lại
          </button>
        </div>

        {/* Center: Visibility Toggle */}
        <div className={styles.visibilityToggle}>
          <button
            type="button"
            className={`${styles.visBtn} ${isPublic ? styles.visBtnActive : ''}`}
            onClick={() => setIsPublic(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Công khai</span>
          </button>
          <button
            type="button"
            className={`${styles.visBtn} ${!isPublic ? styles.visBtnActive : ''}`}
            onClick={() => setIsPublic(false)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Riêng tư</span>
          </button>
        </div>

        {/* Right: Primary Save CTA */}
        <button
          type="button"
          className={styles.saveBtn}
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : 'Lưu & Đăng Bảng Xếp Hạng'}
        </button>
      </div>
    </footer>
  );
}
