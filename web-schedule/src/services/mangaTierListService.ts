import { scheduleApiFetch } from './api';
import type {
  MangaTierListSummary,
  MangaTierListDetail,
  CreateTierListPayload,
} from '@/types/tierList';

export type { MangaTierListSummary, MangaTierListDetail };

export const mangaTierListService = {
  async getTopPublicTierLists(limit = 4): Promise<MangaTierListSummary[]> {
    try {
      const data = await scheduleApiFetch<MangaTierListSummary[]>(
        `/manga-tier-lists/top-public?limit=${limit}`
      );
      return data || [];
    } catch (err) {
      console.error('Failed to fetch real public tier lists from API:', err);
      return [];
    }
  },

  async getAllPublic(page = 0, size = 20): Promise<MangaTierListSummary[]> {
    try {
      const data = await scheduleApiFetch<MangaTierListSummary[]>(
        `/manga-tier-lists?page=${page}&size=${size}`
      );
      return data || [];
    } catch (err) {
      console.error('Failed to fetch public tier lists:', err);
      return [];
    }
  },

  async getMyTierLists(): Promise<MangaTierListSummary[]> {
    try {
      const data = await scheduleApiFetch<MangaTierListSummary[]>('/manga-tier-lists/my');
      return data || [];
    } catch (err) {
      console.error('Failed to fetch user tier lists:', err);
      return [];
    }
  },

  async getTierListDetail(id: string): Promise<MangaTierListDetail | null> {
    try {
      const data = await scheduleApiFetch<MangaTierListDetail>(`/manga-tier-lists/${id}`);
      return data;
    } catch (err) {
      console.error('Failed to fetch tier list detail:', err);
      return null;
    }
  },

  async createTierList(payload: CreateTierListPayload): Promise<MangaTierListDetail> {
    return scheduleApiFetch<MangaTierListDetail>('/manga-tier-lists', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateTierList(id: string, payload: CreateTierListPayload): Promise<MangaTierListDetail> {
    return scheduleApiFetch<MangaTierListDetail>(`/manga-tier-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteTierList(id: string): Promise<void> {
    await scheduleApiFetch<void>(`/manga-tier-lists/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleLike(id: string): Promise<{ liked: boolean }> {
    return scheduleApiFetch<{ liked: boolean }>(`/manga-tier-lists/${id}/like`, {
      method: 'POST',
    });
  },

  async recordView(id: string): Promise<void> {
    try {
      await scheduleApiFetch<void>(`/manga-tier-lists/${id}/view`, {
        method: 'POST',
      });
    } catch {
      // Ignore background view increment errors
    }
  },
};
