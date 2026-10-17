import { scheduleApiFetch } from './api';

export interface MangaTierListSummary {
  id: string;
  title: string;
  description: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  totalItems: number;
  topCovers: string[];
  likesCount: number;
  isPublic: boolean;
  createdAt: string;
  timeAgo: string;
}

export const mangaTierListService = {
  async getTopPublicTierLists(limit = 10): Promise<MangaTierListSummary[]> {
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
};
