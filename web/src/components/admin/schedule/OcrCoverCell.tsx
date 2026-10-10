'use client';

import React, { useRef, useState } from 'react';
import { mediaService } from '@/services/mediaService';
import styles from './ocrCoverCell.module.css';

interface OcrCoverCellProps {
  coverUrl?: string;
  onCoverChange: (url?: string) => void;
}

export default function OcrCoverCell({
  coverUrl,
  onCoverChange,
}: OcrCoverCellProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP...)');
      return;
    }

    try {
      setIsUploading(true);
      const res = await mediaService.uploadMedia(file);
      onCoverChange(res.url);
    } catch (err: unknown) {
      console.error('Failed to upload cover', err);
      const msg = err instanceof Error ? err.message : 'Tải ảnh thất bại';
      alert(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isUploading) {
    return <span className={styles.uploadingText}>Đang tải...</span>;
  }

  return (
    <div className={styles.coverContainer}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {coverUrl ? (
        <>
          <div className={styles.thumbWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="Bìa" className={styles.thumbImg} />
          </div>
          <div className={styles.actionCol}>
            <button
              type="button"
              className={styles.miniBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              Đổi
            </button>
            <button
              type="button"
              className={`${styles.miniBtn} ${styles.deleteBtn}`}
              onClick={() => onCoverChange(undefined)}
            >
              Xóa
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => fileInputRef.current?.click()}
        >
          Chọn ảnh
        </button>
      )}
    </div>
  );
}
