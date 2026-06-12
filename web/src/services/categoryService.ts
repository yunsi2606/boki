import { api } from './api';
import type { Category } from '@/types';

export const categoryService = {
  getCategories: (): Promise<Category[]> =>
    api.get<Category[]>('/categories'),

  getCategoryById: (id: number): Promise<Category> =>
    api.get<Category>(`/categories/${id}`),
};
