import { api } from './api';
import type { Book } from '@/types';

const FALLBACK_HOT_KEYWORDS = [
  'Manga Shounen',
  'Light Novel',
  'One Piece',
  'Conan',
  'Doraemon',
  'Jujutsu Kaisen',
  'Spy x Family',
  'Truyện Tranh Màu',
];

export const searchService = {
  getHotKeywords: async (): Promise<string[]> => {
    try {
      const keywords = await api.get<string[]>('/public/search/hot-keywords');
      if (Array.isArray(keywords) && keywords.length > 0) {
        return keywords;
      }
      return FALLBACK_HOT_KEYWORDS;
    } catch (e) {
      console.warn('Failed to fetch hot keywords, using fallback list:', e);
      return FALLBACK_HOT_KEYWORDS;
    }
  },

  getSuggestions: async (query: string, limit = 5): Promise<Book[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    try {
      const res = await api.get<Book[]>(`/books?search=${encodeURIComponent(trimmed)}&size=${limit}`);
      return Array.isArray(res) ? res : [];
    } catch (e) {
      console.error('Failed to fetch book suggestions:', e);
      return [];
    }
  },
};
