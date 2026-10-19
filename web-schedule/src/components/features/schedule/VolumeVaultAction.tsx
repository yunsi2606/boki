'use client';

import { useState } from 'react';
import { mangaCollectionService } from '@/services/mangaCollectionService';
import styles from './volumeVaultAction.module.css';

interface Props {
  scheduleId: string;
  editionId?: string;
  initialStatus?: string | null;
}

export function VolumeVaultAction({ scheduleId, editionId, initialStatus }: Props) {
  const [status, setStatus] = useState<string | null>(initialStatus || null);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (newStatus: 'OWNED' | 'WISHLIST') => {
    try {
      setSaving(true);
      await mangaCollectionService.upsertItem({
        scheduleId,
        editionId,
        status: newStatus,
      });
      setStatus(newStatus);
    } catch {
      alert('Vui lòng đăng nhập tài khoản Boki để lưu vào tủ sách cá nhân.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.vaultContainer}>
      <div className={styles.vaultHeader}>
        <div className={styles.kicker}>BỘ SƯU TẬP CỦA BẠN</div>
        <p className={styles.subtitle}>Lưu trữ và theo dõi tiến độ sưu tầm tập truyện</p>
      </div>

      <div className={styles.btnRow}>
        <button
          type="button"
          className={`${styles.vaultBtn} ${styles.vaultBtnOwned}`}
          onClick={() => handleUpdate('OWNED')}
          disabled={saving}
        >
          {status === 'OWNED' ? 'Đã trong tủ sách cá nhân' : 'Đánh dấu đã sở hữu'}
        </button>
        <button
          type="button"
          className={`${styles.vaultBtn} ${styles.vaultBtnWishlist}`}
          onClick={() => handleUpdate('WISHLIST')}
          disabled={saving}
        >
          {status === 'WISHLIST' ? 'Đã thêm vào Wishlist' : 'Thêm vào Wishlist'}
        </button>
      </div>
    </div>
  );
}
