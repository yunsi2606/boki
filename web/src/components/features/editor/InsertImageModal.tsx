'use client';

import { useState, useRef } from 'react';
import { mediaService } from '@/services/mediaService';
import styles from './editor.module.css';

interface InsertImageModalProps {
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}

export default function InsertImageModal({ onClose, onInsert }: InsertImageModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await mediaService.uploadMedia(file);
      setUploadedUrl(result.url);
      if (!alt) setAlt(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err) {
      alert('Upload thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const finalUrl = activeTab === 'upload' ? uploadedUrl : url;
    if (!finalUrl) return;
    onInsert(finalUrl, alt);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Chèn Ảnh</h3>

        <div className={styles.tabRow}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Tải ảnh lên
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'url' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('url')}
          >
            Nhập URL
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {uploadedUrl ? (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={uploadedUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '12px' }}
                />
                <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Đã tải lên thành công
                </p>
              </div>
            ) : (
              <div
                className={`${styles.uploadArea} ${uploading ? styles.uploading : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <p>Đang tải lên...</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#94a3b8' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p><strong>Nhấp để chọn ảnh</strong> hoặc kéo thả vào đây</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>PNG, JPG, GIF, WebP (tối đa 10MB)</p>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.modalField}>
            <label>URL ảnh</label>
            <input
              className={styles.modalInput}
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        <div className={styles.modalField}>
          <label>Chú thích ảnh (alt text)</label>
          <input
            className={styles.modalInput}
            type="text"
            placeholder="Mô tả ảnh..."
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose}>Hủy</button>
          <button
            className={styles.modalSubmitBtn}
            onClick={handleSubmit}
            disabled={!(activeTab === 'upload' ? uploadedUrl : url)}
          >
            Chèn ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
