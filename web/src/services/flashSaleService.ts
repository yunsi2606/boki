import { api } from './api';
import type {
  FlashSale,
  PublicFlashSale,
  FlashSaleInput,
  FlashSaleStatus,
} from '@/types/flashSale';

export const flashSaleService = {
  // Public Storefront APIs
  getActiveFlashSale: async (): Promise<PublicFlashSale | null> => {
    try {
      return await api.get<PublicFlashSale>('/flash-sales/active', { bypassCache: true });
    } catch {
      return null;
    }
  },

  getUpcomingOrActiveSales: async (): Promise<PublicFlashSale[]> => {
    try {
      return await api.get<PublicFlashSale[]>('/flash-sales/upcoming', { bypassCache: true });
    } catch {
      return [];
    }
  },

  // Admin Management APIs
  getAllAdminSales: async (): Promise<FlashSale[]> => {
    return api.get<FlashSale[]>('/admin/flash-sales', { bypassCache: true });
  },

  getAdminSaleById: async (id: string): Promise<FlashSale> => {
    return api.get<FlashSale>(`/admin/flash-sales/${id}`, { bypassCache: true });
  },

  createFlashSale: async (data: FlashSaleInput): Promise<FlashSale> => {
    return api.post<FlashSale>('/admin/flash-sales', data);
  },

  updateFlashSale: async (id: string, data: FlashSaleInput): Promise<FlashSale> => {
    return api.put<FlashSale>(`/admin/flash-sales/${id}`, data);
  },

  deleteFlashSale: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/flash-sales/${id}`);
  },

  updateStatus: async (id: string, status: FlashSaleStatus): Promise<FlashSale> => {
    return api.patch<FlashSale>(`/admin/flash-sales/${id}/status?status=${status}`, {});
  },
};
