'use client';

import React, { useState, useRef } from 'react';
import type { User } from '@/types';
import { customerProfileService } from '@/services/customerProfileService';
import { mediaService } from '@/services/mediaService';
import { CameraIcon } from '@/components/ui/LineIcons';
import styles from './profile.module.css';

interface ProfileEditModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (updated: User) => void;
}

export default function ProfileEditModal({ user, onClose, onSuccess }: ProfileEditModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn định dạng file hình ảnh (PNG, JPG, WEBP...)');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const res = await mediaService.uploadMedia(file);
      setAvatarUrl(res.url);
    } catch (err: any) {
      console.error('Failed to upload avatar to Cloudflare R2', err);
      setError(err?.message || 'Tải ảnh lên Cloudflare R2 thất bại. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updated = await customerProfileService.updateProfileDetails({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      onSuccess(updated);
    } catch (err: any) {
      setError(err?.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Cập nhật thông tin cá nhân</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.addressForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Họ và tên</label>
            <input
              type="text"
              required
              className={styles.formInput}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Số điện thoại</label>
            <input
              type="tel"
              className={styles.formInput}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ví dụ: 0912345678"
            />
          </div>

          {/* Avatar Upload Section via Cloudflare R2 */}
          <div className={styles.avatarUploadSection}>
            <div className={styles.avatarUploadPreview}>
              <div className={styles.avatarUploadPreviewInner}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar Preview" className={styles.avatarImg} />
                ) : (
                  <span>
                    {displayName
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'U'}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.avatarUploadControls}>
              <div className={styles.avatarUploadButtons}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.uploadFileBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || loading}
                >
                  <CameraIcon size={16} />
                  <span>{uploading ? 'Đang tải lên Cloudflare R2...' : 'Tải ảnh từ thiết bị'}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    className={styles.removeAvatarBtn}
                    onClick={() => setAvatarUrl('')}
                    disabled={uploading || loading}
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>

              {uploading ? (
                <div className={styles.uploadProgressText}>
                  <span>Đang xử lý và lưu trữ trên Cloudflare R2 CDN...</span>
                </div>
              ) : (
                <div className={styles.avatarUploadHint}>
                  Hỗ trợ PNG, JPG, WEBP. Ảnh được lưu trữ trực tiếp trên Cloudflare R2.
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className={styles.formLabel} style={{ marginBottom: 0 }}>Đường dẫn ảnh đại diện (URL)</label>
            </div>
            <input
              type="url"
              className={styles.formInput}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://... hoặc tải ảnh từ nút phía trên"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className={styles.editProfileBtn}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.saveAddressBtn}
              style={{ marginTop: 0 }}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
