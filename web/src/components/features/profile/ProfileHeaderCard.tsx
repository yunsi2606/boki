'use client';

import React, { useState, useRef } from 'react';
import type { User } from '@/types';
import { ShieldCheckIcon, CameraIcon } from '@/components/ui/LineIcons';
import { mediaService } from '@/services/mediaService';
import { customerProfileService } from '@/services/customerProfileService';
import ProfileEditModal from './ProfileEditModal';
import styles from './profile.module.css';

interface ProfileHeaderCardProps {
  user: User;
  onUserUpdated: (updated: User) => void;
}

export default function ProfileHeaderCard({ user, onUserUpdated }: ProfileHeaderCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const tier = (user?.memberTier || 'STANDARD').toUpperCase();

  const handleDirectAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP...)');
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await mediaService.uploadMedia(file);
      const updated = await customerProfileService.updateProfileDetails({
        displayName: user.displayName || 'Khách hàng Boki',
        avatarUrl: res.url,
        phoneNumber: user.phoneNumber || undefined,
      });
      onUserUpdated(updated);
    } catch (err: any) {
      console.error('Failed to upload avatar to Cloudflare R2', err);
      alert(err?.message || 'Tải ảnh đại diện lên Cloudflare R2 thất bại. Vui lòng thử lại!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className={styles.profileHeader}>
        <div className={styles.profileUserInfo}>
          <div className={`${styles.avatarRingLarge} ${styles[`tierRing_${tier}`] || styles.tierRing_STANDARD}`}>
            <div className={styles.avatarLarge}>
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.displayName || 'User'} className={styles.avatarImg} />
              ) : (
                <span>{initials}</span>
              )}

              {uploadingAvatar && (
                <div className={styles.avatarUploadingOverlay}>
                  <span>Đang tải...</span>
                </div>
              )}
            </div>

            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleDirectAvatarUpload(e.target.files[0]);
                }
              }}
            />

            <button
              type="button"
              className={styles.avatarCameraBtn}
              onClick={() => avatarFileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Đổi ảnh đại diện (Tải lên Cloudflare R2)"
            >
              <CameraIcon size={14} />
            </button>
          </div>

          <div className={styles.userDetails}>
            <h1>
              <span>{user?.displayName || 'Khách hàng Boki'}</span>
              {user?.phoneVerified ? (
                <span className={styles.verifiedBadge}>
                  <ShieldCheckIcon size={14} color="#16a34a" />
                  Đã xác minh
                </span>
              ) : (
                <span className={styles.unverifiedBadge}>
                  Chưa xác minh SĐT
                </span>
              )}
            </h1>

            <div className={styles.userMeta}>
              <span>{user?.email}</span>
              {user?.phoneNumber && <span>• {user.phoneNumber}</span>}
              {user?.createdAt && <span>• Thành viên từ {formatDate(user.createdAt)}</span>}
            </div>
          </div>
        </div>

        <div>
          <button
            className={styles.editProfileBtn}
            onClick={() => setIsEditOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Cập nhật thông tin</span>
          </button>
        </div>
      </div>

      {isEditOpen && (
        <ProfileEditModal
          user={user}
          onClose={() => setIsEditOpen(false)}
          onSuccess={(updated) => {
            onUserUpdated(updated);
            setIsEditOpen(false);
          }}
        />
      )}
    </>
  );
}
