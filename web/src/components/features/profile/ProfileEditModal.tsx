'use client';

import React, { useState } from 'react';
import type { User } from '@/types';
import { customerProfileService } from '@/services/customerProfileService';
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
  const [error, setError] = useState<string | null>(null);

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

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Link ảnh đại diện (Avatar URL)</label>
            <input
              type="url"
              className={styles.formInput}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
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
