import React from 'react';
import { HardDrive, CheckCircle2, Trash2, Sparkles } from 'lucide-react';
import type { StorageStats } from '@/types/storage';
import { formatBytes } from '@/types/storage';
import styles from './StorageStatsCards.module.css';

interface StorageStatsCardsProps {
  stats: StorageStats;
}

export default function StorageStatsCards({ stats }: StorageStatsCardsProps) {
  const totalFiles = stats?.totalFiles ?? 0;
  const usedFiles = stats?.usedFiles ?? 0;
  const orphanFiles = stats?.orphanFiles ?? 0;
  const totalBytesFormatted = formatBytes(stats?.totalBytes ?? 0);
  const orphanBytesFormatted = formatBytes(stats?.orphanBytes ?? 0);
  const storageLabel = stats?.r2Connected ? 'Cloudflare R2' : 'Local Storage';

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Tổng số tệp lưu trữ</span>
          <span className={styles.statValue}>{totalFiles.toLocaleString('vi-VN')}</span>
          <span className={styles.statSubtext}>
            {totalBytesFormatted} ({storageLabel})
          </span>
        </div>
        <div className={`${styles.statIconWrapper} ${styles.iconBlue}`}>
          <HardDrive size={22} />
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Tệp đang sử dụng</span>
          <span className={styles.statValue}>{usedFiles.toLocaleString('vi-VN')}</span>
          <span className={styles.statSubtext}>Liên kết trong Sách, Blog, User...</span>
        </div>
        <div className={`${styles.statIconWrapper} ${styles.iconGreen}`}>
          <CheckCircle2 size={22} />
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Tệp rác / Mồ côi</span>
          <span className={styles.statValue}>{orphanFiles.toLocaleString('vi-VN')}</span>
          <span className={styles.statSubtext}>Không thuộc dữ liệu nào</span>
        </div>
        <div className={`${styles.statIconWrapper} ${styles.iconOrange}`}>
          <Trash2 size={22} />
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statInfo}>
          <span className={styles.statLabel}>Dung lượng có thể giải phóng</span>
          <span className={styles.statValue}>{orphanBytesFormatted}</span>
          <span className={styles.statSubtext}>
            {orphanFiles > 0 ? 'Sẵn sàng dọn dẹp an toàn' : 'Không có tệp thừa'}
          </span>
        </div>
        <div className={`${styles.statIconWrapper} ${styles.iconPurple}`}>
          <Sparkles size={22} />
        </div>
      </div>
    </div>
  );
}
