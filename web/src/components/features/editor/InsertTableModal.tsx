'use client';

import { useState } from 'react';
import styles from './editor.module.css';

interface InsertTableModalProps {
  onClose: () => void;
  onInsert: (rows: number, cols: number, hasHeader: boolean) => void;
}

export default function InsertTableModal({ onClose, onInsert }: InsertTableModalProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);

  const handleSubmit = () => {
    if (rows < 1 || cols < 1) return;
    onInsert(rows, cols, hasHeader);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Chèn Bảng</h3>

        <div className={styles.gridSelector}>
          <div className={styles.gridRow}>
            <label>Số hàng:</label>
            <input
              type="number"
              className={styles.numInput}
              min={1}
              max={20}
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className={styles.gridRow}>
            <label>Số cột:</label>
            <input
              type="number"
              className={styles.numInput}
              min={1}
              max={10}
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
            />
          </div>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
            />
            Có dòng tiêu đề
          </label>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose}>Hủy</button>
          <button className={styles.modalSubmitBtn} onClick={handleSubmit}>
            Chèn bảng
          </button>
        </div>
      </div>
    </div>
  );
}
