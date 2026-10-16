import { api } from './api';
import type {
  MangaCollectionStats,
  UpdateCollectionItemPayload,
  UserMangaCollectionItem,
} from '@/types/mangaCollection';

export const mangaCollectionService = {
  getUserCollection: async (status?: string): Promise<UserMangaCollectionItem[]> => {
    const qs = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return api.get<UserMangaCollectionItem[]>(`/user-collections${qs}`);
  },

  upsertItem: async (payload: UpdateCollectionItemPayload): Promise<UserMangaCollectionItem> => {
    return api.post<UserMangaCollectionItem>('/user-collections', payload);
  },

  deleteItem: async (scheduleId: string): Promise<void> => {
    return api.delete<void>(`/user-collections/${scheduleId}`);
  },

  getStats: async (): Promise<MangaCollectionStats> => {
    return api.get<MangaCollectionStats>('/user-collections/stats');
  },
};
