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

  downloadExcelTemplate: async (): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('boki_access_token') : null;
    const res = await fetch('http://localhost:8080/api/admin/books/excel/template', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Không thể tải biểu mẫu Excel');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boki_bieu_mau_them_sach.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  importBookExcel: async (formData: FormData, dryRun: boolean): Promise<import('@/types/bookExcel').BookExcelImportResult> => {
    return api.upload<import('@/types/bookExcel').BookExcelImportResult>(
      `/admin/books/excel/import?dryRun=${dryRun}`,
      formData
    );
  },
};

