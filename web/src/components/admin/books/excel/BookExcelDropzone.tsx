'use client';

import React, { useRef } from 'react';
import styles from './bookExcelModal.module.css';

interface BookExcelDropzoneProps {
  excelFile: File | null;
  onExcelSelect: (file: File) => void;
  imageFiles: File[];
  onImagesSelect: (files: File[]) => void;
}

export default function BookExcelDropzone({
  excelFile,
  onExcelSelect,
  imageFiles,
  onImagesSelect,
}: BookExcelDropzoneProps) {
  const excelInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onExcelSelect(e.target.files[0]);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      onImagesSelect(selected);
    }
  };

  return (
    <div className={styles.dropzoneGrid}>
      {/* Excel File Picker */}
      <div
        className={styles.dropzoneCard}
        onClick={() => excelInputRef.current?.click()}
      >
        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleExcelChange}
        />
        <div className={styles.dropzoneTitle}>Tệp Excel (.xlsx)</div>
        <div className={styles.dropzoneDesc}>
          Bấm để chọn tệp bảng tính biểu mẫu nhập sách
        </div>
        {excelFile ? (
          <div className={styles.fileBadge}>
            Đã chọn: {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
          </div>
        ) : (
          <div className={styles.fileBadge}>Chưa có tệp nào</div>
        )}
      </div>

      {/* Image Files Picker */}
      <div
        className={styles.dropzoneCard}
        onClick={() => imagesInputRef.current?.click()}
      >
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImagesChange}
        />
        <div className={styles.dropzoneTitle}>Tệp ảnh từ máy (Tùy chọn)</div>
        <div className={styles.dropzoneDesc}>
          Chọn nhiều ảnh lẻ (tên trùng khớp với Excel hoặc ISBN)
        </div>
        {imageFiles.length > 0 ? (
          <div className={styles.fileBadge}>
            Đã chọn: {imageFiles.length} tệp ảnh
          </div>
        ) : (
          <div className={styles.fileBadge}>Tùy chọn (có thể để trống)</div>
        )}
      </div>
    </div>
  );
}
