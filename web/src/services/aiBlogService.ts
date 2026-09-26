import { api } from './api';
import type { AiGenerateBlogRequest, AiGenerateBlogResponse } from '@/types/aiBlog';

export const aiBlogService = {
  /**
   * Request AI generation for blog post (Full article, Outline, Polish, SEO, Excerpt).
   */
  generate: async (payload: AiGenerateBlogRequest): Promise<AiGenerateBlogResponse> => {
    return api.post<AiGenerateBlogResponse>('/admin/blogs/ai/generate', payload);
  },
};
