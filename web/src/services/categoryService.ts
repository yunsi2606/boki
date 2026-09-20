import { api } from './api';
import type { Category, CategoryCheckResult, CreateCategoryPayload } from '@/types';

export const categoryService = {
  getCategories: (): Promise<Category[]> =>
    api.get<Category[]>('/categories'),

  getCategoryById: (id: number): Promise<Category> =>
    api.get<Category>(`/categories/${id}`),

  checkCategory: (name: string): Promise<CategoryCheckResult> =>
    api.get<CategoryCheckResult>(`/categories/check?name=${encodeURIComponent(name)}`),

  createCategory: (payload: CreateCategoryPayload): Promise<Category> =>
    api.post<Category>('/categories', payload),
};
