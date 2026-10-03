import { api } from './api';
import type { StorageStats, OrphanFile, StorageCleanResult } from '@/types/storage';

export const storageService = {
  getStats: async (): Promise<StorageStats> => {
    return api.get<StorageStats>('/admin/storage/stats', { bypassCache: true });
  },

  getOrphans: async (): Promise<OrphanFile[]> => {
    return api.get<OrphanFile[]>('/admin/storage/orphans', { bypassCache: true });
  },

  deleteOrphan: async (key: string): Promise<{ success: boolean; message: string }> => {
    return api.delete<{ success: boolean; message: string }>(
      `/admin/storage/orphans?key=${encodeURIComponent(key)}`
    );
  },

  cleanAllOrphans: async (): Promise<StorageCleanResult> => {
    return api.post<StorageCleanResult>('/admin/storage/orphans/clean-all', {});
  },
};
