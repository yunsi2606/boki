'use client';

import React, { useState } from 'react';
import type { TierDefinition } from '@/types/tierList';
import styles from './tierCustomModal.module.css';

interface TierCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: TierDefinition[];
  onAddTier: (name: string, color: string) => void;
  onUpdateTier: (id: string, name: string, color: string) => void;
  onRemoveTier: (tierName: string) => void;
  onResetTiers: () => void;
}

const COLOR_PRESETS = [
  '#EE4D2D', // Boki Primary Red
  '#FF9800', // Amber
  '#F59F00', // Golden
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Slate Gray
  '#1F2937', // Dark
];

export function TierCustomModal({
  isOpen,
  onClose,
  tiers,
  onAddTier,
  onUpdateTier,
  onRemoveTier,
  onResetTiers,
}: TierCustomModalProps) {
  const [newTierName, setNewTierName] = useState('');
  const [newTierColor, setNewTierColor] = useState('#EE4D2D');

  if (!isOpen) return null;

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim()) return;
    onAddTier(newTierName.trim(), newTierColor);
    setNewTierName('');
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tùy biến các bậc xếp hạng (Tiers)</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Existing tiers list */}
        <div className={styles.tierList}>
          {tiers.map((t) => (
            <div key={t.id || t.name} className={styles.tierItem}>
              <div className={styles.tierColorSquare} style={{ backgroundColor: t.color }} />
              <input
                type="text"
                className={styles.tierInput}
                value={t.name}
                onChange={(e) => onUpdateTier(t.id, e.target.value, t.color)}
              />
              <div className={styles.colorPalette}>
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorDot} ${t.color === c ? styles.colorDotActive : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => onUpdateTier(t.id, t.name, c)}
                    title={`Chọn màu ${c}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.deleteTierBtn}
                onClick={() => onRemoveTier(t.name)}
                title="Xóa bậc này"
                disabled={tiers.length <= 1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add new tier row */}
        <form onSubmit={handleAddNew} className={styles.addForm}>
          <input
            type="text"
            className={styles.addInput}
            placeholder="Tên bậc mới (VD: GOAT, SS, Siêu phẩm...)"
            value={newTierName}
            onChange={(e) => setNewTierName(e.target.value)}
          />
          <div className={styles.colorPalette}>
            {COLOR_PRESETS.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorDot} ${newTierColor === c ? styles.colorDotActive : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setNewTierColor(c)}
              />
            ))}
          </div>
          <button type="submit" className={styles.addBtn}>
            + Thêm bậc
          </button>
        </form>

        <div className={styles.footer}>
          <button type="button" className={styles.resetBtn} onClick={onResetTiers}>
            Khôi phục mặc định (S, A, B, C, D, E, F)
          </button>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
