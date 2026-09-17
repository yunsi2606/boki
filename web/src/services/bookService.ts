import { api } from './api';
import type { Book, BookVariant, CreateBookPayload, UpdateBookPayload } from '@/types';

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

  getAdminBooks: async (search?: string): Promise<Book[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const queryString = params.toString();
    return api.get<Book[]>(`/books/admin${queryString ? `?${queryString}` : ''}`).catch(() => bookService.searchBooks(undefined, search));
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

  getVariants: async (bookId: string): Promise<BookVariant[]> => {
    return api.get<BookVariant[]>(`/books/${bookId}/variants`);
  },

  saveVariants: async (bookId: string, variants: BookVariant[]): Promise<BookVariant[]> => {
    return api.put<BookVariant[]>(`/books/${bookId}/variants`, variants);
  },

  incrementViews: async (idOrSlug: string): Promise<void> => {
    return api.post<void>(`/books/${idOrSlug}/views`, {});
  },
};
