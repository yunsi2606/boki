import { api } from './api';
import type { Book, CreateBookPayload, UpdateBookPayload } from '@/types';

export const bookService = {
  searchBooks: async (categoryId?: number, search?: string): Promise<Book[]> => {
    const params = new URLSearchParams();
    if (categoryId !== undefined && categoryId !== null) {
      params.append('categoryId', categoryId.toString());
    }
    if (search) {
      params.append('search', search);
    }
    const queryString = params.toString();
    return api.get<Book[]>(`/books${queryString ? `?${queryString}` : ''}`);
  },

  getBook: async (id: string): Promise<Book> => {
    return api.get<Book>(`/books/${id}`);
  },

  getSellerBooks: async (): Promise<Book[]> => {
    return api.get<Book[]>('/books/seller');
  },

  createBook: async (payload: CreateBookPayload): Promise<Book> => {
    return api.post<Book>('/books', payload);
  },

  updateBook: async (id: string, payload: UpdateBookPayload): Promise<Book> => {
    return api.put<Book>(`/books/${id}`, payload);
  },

  deleteBook: async (id: string): Promise<void> => {
    return api.delete<void>(`/books/${id}`);
  },
};
