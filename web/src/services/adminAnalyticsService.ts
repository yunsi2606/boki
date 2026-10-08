import { api } from './api';
import type { RevenueTrendsData, CategoryRevenueShare, TopSellingBook } from '@/types/adminAnalytics';

export const adminAnalyticsService = {
  async getRevenueTrends(days = 7): Promise<RevenueTrendsData> {
    try {
      return await api.get<RevenueTrendsData>(`/admin/analytics/revenue-trends?days=${days}`);
    } catch (err) {
      console.warn('Failed to fetch revenue trends:', err);
      return {
        days,
        totalRevenuePeriod: 0,
        totalOrdersPeriod: 0,
        timeline: [],
      };
    }
  },

  async getCategoryDistribution(): Promise<CategoryRevenueShare[]> {
    try {
      return await api.get<CategoryRevenueShare[]>('/admin/analytics/categories');
    } catch (err) {
      console.warn('Failed to fetch category distribution:', err);
      return [];
    }
  },

  async getTopSellingBooks(limit = 5): Promise<TopSellingBook[]> {
    try {
      return await api.get<TopSellingBook[]>(`/admin/analytics/top-books?limit=${limit}`);
    } catch (err) {
      console.warn('Failed to fetch top selling books:', err);
      return [];
    }
  },
};
