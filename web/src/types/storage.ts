export interface StorageStats {
  totalFiles: number;
  totalBytes: number;
  usedFiles: number;
  usedBytes: number;
  orphanFiles: number;
  orphanBytes: number;
  r2Connected: boolean;
  bucketName: string;
}

export interface OrphanFile {
  key: string;
  url: string;
  sizeBytes: number;
  sizeFormatted: string;
  lastModified: string;
  extension: string;
}

export interface StorageCleanResult {
  deletedCount: number;
  deletedBytes: number;
  deletedBytesFormatted: string;
  message: string;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
