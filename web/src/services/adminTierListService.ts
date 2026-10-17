import { api } from './api';
import type {
  MangaTierListSummary,
  MangaTierListDetail,
  CreateTierListPayload,
} from '@/types/tierList';

export const adminTierListService = {
  getTierLists: async (keyword?: string): Promise<MangaTierListSummary[]> => {
    const params = new URLSearchParams();
    if (keyword && keyword.trim()) {
      params.append('keyword', keyword.trim());
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    return api.get<MangaTierListSummary[]>(`/admin/manga-tier-lists${qs}`, {
      bypassCache: true,
    });
  },

  getTierListDetail: async (id: string): Promise<MangaTierListDetail> => {
    return api.get<MangaTierListDetail>(`/manga-tier-lists/${id}`, {
      bypassCache: true,
    });
  },

  createTierList: async (payload: CreateTierListPayload): Promise<MangaTierListDetail> => {
    return api.post<MangaTierListDetail>('/admin/manga-tier-lists', payload);
  },

  updateTierList: async (id: string, payload: CreateTierListPayload): Promise<MangaTierListDetail> => {
    return api.put<MangaTierListDetail>(`/admin/manga-tier-lists/${id}`, payload);
  },

  deleteTierList: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/manga-tier-lists/${id}`);
  },

  togglePublic: async (id: string): Promise<{ id: string; isPublic: boolean }> => {
    return api.patch<{ id: string; isPublic: boolean }>(`/admin/manga-tier-lists/${id}/toggle-public`);
  },
};
