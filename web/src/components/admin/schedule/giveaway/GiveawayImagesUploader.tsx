'use client';

import { useRef, useState } from 'react';
import { mediaService } from '@/services/mediaService';
import styles from './adminGiveawayCampaignModal.module.css';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function GiveawayImagesUploader({ images, onChange, maxImages = 6 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Đã đạt giới hạn tối đa ${maxImages} ảnh.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const res = await mediaService.uploadMedia(file);
        if (res?.url) newUrls.push(res.url);
      } catch (err: any) {
        console.error('Failed to upload', err);
      }
    }

    setUploading(false);
    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label className={styles.label}>
          Ảnh thực tế phần quà / sản phẩm ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-primary-600)',
              background: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-200)',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Đang tải lên...' : '+ Thêm ảnh chụp thật'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-neutral-300)',
            borderRadius: 8,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--color-neutral-50)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-neutral-700)' }}>
            Chưa có ảnh chụp thực tế nào
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4 }}>
            Click để chọn nhiều ảnh (bìa trước, quà tặng kèm, standee, seal...)
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8 }}>
          {images.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                aspectRatio: '1',
                border: idx === 0 ? '2px solid var(--color-primary-500)' : '1px solid var(--color-neutral-300)',
                background: '#000',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Ảnh ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {idx === 0 && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(238, 77, 45, 0.9)',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    textAlign: 'center',
                    padding: '2px 0',
                  }}
                >
                  Ảnh chính
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                title="Xóa ảnh này"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: 9999,
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 12,
                  lineHeight: 1,
                }}
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
