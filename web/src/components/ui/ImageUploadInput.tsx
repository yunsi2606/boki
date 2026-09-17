'use client';

import React, { useRef, useState } from 'react';
import { mediaService } from '@/services/mediaService';
import styles from './ImageUploadInput.module.css';

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
}

export default function ImageUploadInput({
  label,
  value,
  onChange,
  placeholder = 'Chọn file ảnh từ máy tính hoặc kéo thả vào đây',
  helperText,
}: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP...)');
      return;
    }

    setUploading(true);
    try {
      const res = await mediaService.uploadMedia(file);
      onChange(res.url);
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}

      {value ? (
        <div className={styles.previewWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className={styles.previewImg} />
          <div className={styles.previewActions}>
            <button
              type="button"
              onClick={() => onChange('')}
              className={styles.removeBtn}
              title="Xóa hình ảnh này"
            >
              ✕ Xóa ảnh
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner}></div>
              <span>☁️ Đang tải lên Cloudflare R2...</span>
            </div>
          ) : (
            <>
              <span className={styles.dropzoneIcon}>📁</span>
              <span className={styles.dropzoneText}>{placeholder}</span>
              <span className={styles.dropzoneSubtext}>Tải ảnh trực tiếp lên Cloudflare R2 CDN</span>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInputHidden}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
        </div>
      )}

      {!showUrlInput ? (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className={styles.toggleUrlBtn}
        >
          Hoặc dán đường dẫn URL CDN trực tiếp 🔗
        </button>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dán đường dẫn URL ảnh (https://...)"
          className={styles.urlInput}
        />
      )}

      {helperText && <span className={styles.dropzoneSubtext}>{helperText}</span>}
    </div>
  );
}
