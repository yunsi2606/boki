import { api } from './api';
import type {
  RecommendationBook,
  FrequentlyBoughtTogetherData,
  RecommendationMetrics,
  TrackRecommendationPayload,
} from '@/types/recommendation';

export const recommendationService = {
  getPersonalized: async (sessionId?: string, limit = 10): Promise<RecommendationBook[]> => {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    params.append('limit', limit.toString());
    return api.get<RecommendationBook[]>(`/recommendations/personalized?${params.toString()}`);
  },

  getSimilarBooks: async (idOrSlug: string, limit = 8): Promise<RecommendationBook[]> => {
    return api.get<RecommendationBook[]>(`/recommendations/similar/${idOrSlug}?limit=${limit}`);
  },

  getFrequentlyBoughtTogether: async (idOrSlug: string): Promise<FrequentlyBoughtTogetherData> => {
    return api.get<FrequentlyBoughtTogetherData>(`/recommendations/frequently-bought-together/${idOrSlug}`);
  },

  getCartAddons: async (bookIds: string[], cartTotal = 0, limit = 6): Promise<RecommendationBook[]> => {
    return api.post<RecommendationBook[]>('/recommendations/cart-addons', {
      bookIds,
      cartTotal,
      limit,
    });
  },

  getTrending: async (days = 7, limit = 12): Promise<RecommendationBook[]> => {
    return api.get<RecommendationBook[]>(`/recommendations/trending?days=${days}&limit=${limit}`);
  },

  trackInteraction: async (payload: TrackRecommendationPayload): Promise<void> => {
    try {
      await api.post<void>('/recommendations/track-interaction', payload);
    } catch {
      // Silently ignore tracking errors so they never block user experience
    }
  },

  getMetrics: async (days = 30): Promise<RecommendationMetrics> => {
    return api.get<RecommendationMetrics>(`/admin/recommendations/metrics?days=${days}`);
  },

  recomputeModels: async (): Promise<string> => {
    return api.post<string>('/admin/recommendations/recompute', {});
  },
};
