'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import type { StorageStats, OrphanFile } from '@/types/storage';
import { formatBytes } from '@/types/storage';
import { storageService } from '@/services/storageService';
import StorageStatsCards from '@/components/features/admin/storage/StorageStatsCards';
import StorageOrphanTable from '@/components/features/admin/storage/StorageOrphanTable';
import DeleteSingleOrphanModal from '@/components/features/admin/storage/DeleteSingleOrphanModal';
import CleanAllOrphansModal from '@/components/features/admin/storage/CleanAllOrphansModal';
import styles from './storage.module.css';

export default function AdminStoragePage() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [orphans, setOrphans] = useState<OrphanFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedDeleteFile, setSelectedDeleteFile] = useState<OrphanFile | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);

  const [isCleanAllOpen, setIsCleanAllOpen] = useState(false);
  const [isCleaningAll, setIsCleaningAll] = useState(false);

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setAlert(null);

      const [statsData, orphansData] = await Promise.all([
        storageService.getStats(),
        storageService.getOrphans(),
      ]);

      setStats(statsData);
      setOrphans(orphansData);
    } catch (err: any) {
      console.error('Failed to load storage data:', err);
      setAlert({
        type: 'error',
        text: err?.message || 'Không thể kết nối đến máy chủ lưu trữ. Vui lòng thử lại!',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteSingle = async (key: string) => {
    try {
      setIsDeletingSingle(true);
      await storageService.deleteOrphan(key);
      setAlert({
        type: 'success',
        text: `Đã xóa thành công tệp: ${key}`,
      });
      setSelectedDeleteFile(null);
      await loadData(true);
    } catch (err: any) {
      setAlert({
        type: 'error',
        text: err?.message || 'Lỗi khi xóa tệp. Vui lòng thử lại sau!',
      });
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handleCleanAll = async () => {
    try {
      setIsCleaningAll(true);
      const result = await storageService.cleanAllOrphans();
      setAlert({
        type: 'success',
        text: `Đã dọn dẹp thành công ${result.deletedCount} tệp rác. Giải phóng ${result.deletedBytesFormatted} dung lượng!`,
      });
      setIsCleanAllOpen(false);
      await loadData(true);
    } catch (err: any) {
      setAlert({
        type: 'error',
        text: err?.message || 'Lỗi trong quá trình dọn dẹp rác. Vui lòng thử lại!',
      });
    } finally {
      setIsCleaningAll(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Quản Lý & Dọn Dẹp Bộ Nhớ R2</h1>
          <p className={styles.subtitle}>
            Quét và dọn dẹp các tệp ảnh mồ côi (không còn liên kết với cơ sở dữ liệu) trên Cloudflare R2
          </p>
        </div>

        <div className={styles.actionsArea}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
            <span>{refreshing ? 'Đang quét...' : 'Quét lại bộ nhớ'}</span>
          </button>

          <button
            type="button"
            className={styles.cleanAllBtn}
            onClick={() => setIsCleanAllOpen(true)}
            disabled={loading || refreshing || orphans.length === 0}
          >
            <Trash2 size={16} />
            <span>Dọn dẹp tất cả ({orphans.length})</span>
          </button>
        </div>
      </div>

      {alert && (
        <div
          className={`${styles.alertBanner} ${
            alert.type === 'success' ? styles.alertSuccess : styles.alertError
          }`}
        >
          <div className={styles.alertContent}>
            {alert.type === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{alert.text}</span>
          </div>
          <button
            type="button"
            className={styles.alertCloseBtn}
            onClick={() => setAlert(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div className={styles.loadingBox}>
          <Loader2 size={32} className={styles.spinning} color="#2563eb" />
          <p>Đang phân tích và đối soát tệp tin trên Cloudflare R2...</p>
        </div>
      ) : (
        <>
          {stats && <StorageStatsCards stats={stats} />}
          <StorageOrphanTable
            orphans={orphans}
            onSelectDelete={(file) => setSelectedDeleteFile(file)}
          />
        </>
      )}

      <DeleteSingleOrphanModal
        file={selectedDeleteFile}
        isOpen={Boolean(selectedDeleteFile)}
        onClose={() => setSelectedDeleteFile(null)}
        onConfirm={handleDeleteSingle}
        isDeleting={isDeletingSingle}
      />

      <CleanAllOrphansModal
        orphanCount={orphans.length}
        orphanSizeFormatted={formatBytes(stats?.orphanBytes ?? 0)}
        isOpen={isCleanAllOpen}
        onClose={() => setIsCleanAllOpen(false)}
        onConfirm={handleCleanAll}
        isCleaning={isCleaningAll}
      />
    </div>
  );
}
