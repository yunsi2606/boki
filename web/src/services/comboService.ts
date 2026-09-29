import { api } from './api';
import type { Book, CreateComboPayload, UpdateComboPayload } from '@/types';

export const comboService = {
  getCombos: async (page = 0, size = 20): Promise<Book[]> => {
    return api.get<Book[]>(`/combos?page=${page}&size=${size}`);
  },

  getCombosForBook: async (idOrSlug: string): Promise<Book[]> => {
    return api.get<Book[]>(`/books/${idOrSlug}/combos`);
  },

  createCombo: async (payload: CreateComboPayload): Promise<Book> => {
    return api.post<Book>('/combos', payload);
  },

  updateCombo: async (id: string, payload: UpdateComboPayload): Promise<Book> => {
    return api.put<Book>(`/combos/${id}`, payload);
  },

  deleteCombo: async (id: string): Promise<void> => {
    return api.delete<void>(`/combos/${id}`);
  },
};
