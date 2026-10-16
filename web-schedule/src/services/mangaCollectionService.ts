import { scheduleApiFetch } from './api';
import type {
  UserMangaCollectionItem,
  UpdateUserMangaCollectionPayload,
  CollectionSummaryStats,
} from '@/types/mangaCollection';

export const mangaCollectionService = {
  async getMyCollection(status?: string): Promise<UserMangaCollectionItem[]> {
    const qs = status ? `?status=${status}` : '';
    return scheduleApiFetch<UserMangaCollectionItem[]>(`/user/manga-collection${qs}`);
  },

  async upsertItem(payload: UpdateUserMangaCollectionPayload): Promise<UserMangaCollectionItem> {
    return scheduleApiFetch<UserMangaCollectionItem>('/user/manga-collection', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCollectionStats(): Promise<CollectionSummaryStats> {
    return scheduleApiFetch<CollectionSummaryStats>('/user/manga-collection/stats');
  },

  async deleteItem(id: string): Promise<void> {
    await scheduleApiFetch<void>(`/user/manga-collection/${id}`, {
      method: 'DELETE',
    });
  },
};
