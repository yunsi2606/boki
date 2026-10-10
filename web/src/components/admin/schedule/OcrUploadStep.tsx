'use client';

import React, { useRef } from 'react';
import styles from './ocrUploadStep.module.css';

interface OcrUploadStepProps {
  selectedFile: File | null;
  previewUrl: string | null;
  publishers: string[];
  selectedPublisher: string;
  geminiApiKey: string;
  onFileChange: (file: File) => void;
  onPublisherChange: (pub: string) => void;
  onApiKeyChange: (key: string) => void;
}

export default function OcrUploadStep({
  selectedFile,
  previewUrl,
  publishers,
  selectedPublisher,
  geminiApiKey,
  onFileChange,
  onPublisherChange,
  onApiKeyChange,
}: OcrUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.uploadSection}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
      />

      {!selectedFile ? (
        <div
          className={styles.dropzone}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) onFileChange(e.dataTransfer.files[0]);
          }}
        >
          <p className={styles.dropzoneText}>Chọn ảnh hoặc kéo thả poster lịch phát hành vào đây</p>
          <p className={styles.dropzoneHint}>
            Hỗ trợ mọi định dạng poster (NXB Kim Đồng, Trẻ, IPM, Wings Books, Nhã Nam...)
          </p>
        </div>
      ) : (
        <div className={styles.filePreviewRow}>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className={styles.previewThumb} />
          )}
          <div className={styles.previewInfo}>
            <div className={styles.fileName}>{selectedFile.name}</div>
            <div className={styles.fileSize}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <button
            type="button"
            className={styles.changeFileBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            Chọn ảnh khác
          </button>
        </div>
      )}

      <div className={styles.optionsGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Nhà xuất bản (Tùy chọn):</label>
          <select
            className={styles.formInput}
            value={selectedPublisher}
            onChange={(e) => onPublisherChange(e.target.value)}
          >
            <option value="ALL">Tự động nhận diện từ ảnh</option>
            {publishers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Gemini API Key (Tùy chọn):</label>
          <input
            type="password"
            placeholder="Mặc định sử dụng API Key máy chủ"
            className={styles.formInput}
            value={geminiApiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
