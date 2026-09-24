'use client';

import { useState } from 'react';
import styles from './editor.module.css';

interface InsertLinkModalProps {
  onClose: () => void;
  onInsert: (url: string, text: string) => void;
}

export default function InsertLinkModal({ onClose, onInsert }: InsertLinkModalProps) {
  const [url, setUrl] = useState('https://');
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!url || url === 'https://') return;
    onInsert(url, text || url);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Chèn Liên Kết</h3>

        <div className={styles.modalField}>
          <label>URL</label>
          <input
            className={styles.modalInput}
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.modalField}>
          <label>Văn bản hiển thị</label>
          <input
            className={styles.modalInput}
            type="text"
            placeholder="Nhấp vào đây"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose}>Hủy</button>
          <button
            className={styles.modalSubmitBtn}
            onClick={handleSubmit}
            disabled={!url || url === 'https://'}
          >
            Chèn liên kết
          </button>
        </div>
      </div>
    </div>
  );
}
