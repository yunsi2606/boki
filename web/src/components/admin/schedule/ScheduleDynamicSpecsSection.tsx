'use client';

import React from 'react';
import styles from './scheduleDynamicSpecsSection.module.css';

interface Props {
  specsList: Array<{ key: string; value: string }>;
  onAddSpec: () => void;
  onUpdateSpec: (idx: number, key: string, value: string) => void;
  onRemoveSpec: (idx: number) => void;
}

const BOOK_SPECS_PRESETS = [
  { key: 'Công ty phát hành', defaultVal: '' },
  { key: 'Dịch giả', defaultVal: '' },
  { key: 'Ngôn ngữ', defaultVal: 'Tiếng Việt' },
  { key: 'Hình thức bìa', defaultVal: 'Bìa mềm' },
  { key: 'Số trang', defaultVal: '' },
  { key: 'Kích thước', defaultVal: '' },
  { key: 'Trọng lượng (gam)', defaultVal: '' },
  { key: 'Năm xuất bản', defaultVal: String(new Date().getFullYear()) },
];

export default function ScheduleDynamicSpecsSection({
  specsList,
  onAddSpec,
  onUpdateSpec,
  onRemoveSpec,
}: Props) {
  const existingKeys = specsList.map((s) => s.key.trim().toLowerCase());

  const handleAddPreset = (key: string, defaultVal: string) => {
    if (!existingKeys.includes(key.toLowerCase())) {
      onUpdateSpec(specsList.length, key, defaultVal);
    }
  };

  return (
    <div>
      <div className={styles.specsSectionHeader}>
        <div>
          <span className={styles.sectionTitle}>3. Thuộc tính xuất bản chi tiết (Book Specs)</span>
          <p className={styles.sectionSubtitle}>
            Thêm nhanh các thuộc tính xuất bản chuẩn hóa tương tự Book Entity.
          </p>
        </div>
        <button type="button" className={styles.addSpecBtn} onClick={onAddSpec}>
          + Thêm tùy ý
        </button>
      </div>

      {/* Preset Chips */}
      <div className={styles.presetsRow}>
        {BOOK_SPECS_PRESETS.map((preset) => {
          const isAdded = existingKeys.includes(preset.key.toLowerCase());
          return (
            <button
              key={preset.key}
              type="button"
              className={styles.presetChip}
              style={isAdded ? { opacity: 0.5, cursor: 'default' } : undefined}
              onClick={() => handleAddPreset(preset.key, preset.defaultVal)}
              disabled={isAdded}
            >
              {isAdded ? `✓ ${preset.key}` : `+ ${preset.key}`}
            </button>
          );
        })}
      </div>

      {specsList.length === 0 ? (
        <div className={styles.emptySpecsNotice}>
          Chưa có thông số nào. Nhấn vào các gợi ý bên trên hoặc bấm "+ Thêm tùy ý".
        </div>
      ) : (
        <div className={styles.specsList}>
          {specsList.map((spec, idx) => (
            <div key={idx} className={styles.specRow}>
              <input
                type="text"
                className={styles.specKeyInput}
                value={spec.key}
                placeholder="Tên thuộc tính (VD: Dịch giả)"
                onChange={(e) => onUpdateSpec(idx, e.target.value, spec.value)}
              />
              <input
                type="text"
                className={styles.specValueInput}
                value={spec.value}
                placeholder="Giá trị (VD: Hoàng Trang)"
                onChange={(e) => onUpdateSpec(idx, spec.key, e.target.value)}
              />
              <button
                type="button"
                className={styles.removeSpecBtn}
                title="Xóa thuộc tính này"
                onClick={() => onRemoveSpec(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
