'use client';

import React from 'react';
import styles from './scheduleDynamicSpecsSection.module.css';

interface Props {
  specsList: Array<{ key: string; value: string }>;
  onAddSpec: () => void;
  onUpdateSpec: (idx: number, key: string, value: string) => void;
  onRemoveSpec: (idx: number) => void;
}

export default function ScheduleDynamicSpecsSection({
  specsList,
  onAddSpec,
  onUpdateSpec,
  onRemoveSpec,
}: Props) {
  return (
    <div>
      <div className={styles.specsSectionHeader}>
        <div>
          <span className={styles.sectionTitle}>3. Thông số kỹ thuật bổ sung (Dynamic Specs)</span>
          <p className={styles.sectionSubtitle}>
            Tùy biến các trường linh hoạt (Khổ sách, Số trang, Dịch giả, Loại giấy, Quy cách in...)
          </p>
        </div>
        <button type="button" className={styles.addSpecBtn} onClick={onAddSpec}>
          + Thêm thông số
        </button>
      </div>

      {specsList.length === 0 ? (
        <div className={styles.emptySpecsNotice}>
          Chưa có thông số động nào. Nhấn "+ Thêm thông số" để bổ sung trường thông tin tự do.
        </div>
      ) : (
        <div className={styles.specsList}>
          {specsList.map((spec, idx) => (
            <div key={idx} className={styles.specRow}>
              <input
                type="text"
                className={styles.specKeyInput}
                value={spec.key}
                placeholder="Tên thông số (VD: Khổ sách)"
                onChange={(e) => onUpdateSpec(idx, e.target.value, spec.value)}
              />
              <input
                type="text"
                className={styles.specValueInput}
                value={spec.value}
                placeholder="Giá trị (VD: 11.3 x 17.6 cm)"
                onChange={(e) => onUpdateSpec(idx, spec.key, e.target.value)}
              />
              <button
                type="button"
                className={styles.removeSpecBtn}
                title="Xóa thông số này"
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
