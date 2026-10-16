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
      alert('Vui lòng đăng nhập để lưu vào tủ sách cá nhân.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.vaultActionBox}>
      <button
        type="button"
        className={`${styles.vaultBtn} ${styles.vaultBtnOwned}`}
        onClick={() => handleUpdate('OWNED')}
        disabled={saving}
      >
        {status === 'OWNED' ? 'Đã trong tủ sách' : 'Đánh dấu đã sở hữu'}
      </button>
      <button
        type="button"
        className={`${styles.vaultBtn} ${styles.vaultBtnWishlist}`}
        onClick={() => handleUpdate('WISHLIST')}
        disabled={saving}
      >
        {status === 'WISHLIST' ? 'Đã thêm Wishlist' : 'Thêm vào Wishlist'}
      </button>
    </div>
  );
}
