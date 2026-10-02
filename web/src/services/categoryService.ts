import { api } from './api';
import type { Category, CategoryCheckResult, CreateCategoryPayload } from '@/types';

let cachedCategories: Category[] | null = null;
let pendingPromise: Promise<Category[]> | null = null;

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    if (cachedCategories) return cachedCategories;
    if (pendingPromise) return pendingPromise;

    pendingPromise = api
      .get<Category[]>('/categories')
      .then((cats) => {
        cachedCategories = cats;
        pendingPromise = null;
        return cats;
      })
      .catch((err) => {
        pendingPromise = null;
        throw err;
      });

    return pendingPromise;
  },

  getCategoryById: (id: number): Promise<Category> =>
    api.get<Category>(`/categories/${id}`),

  checkCategory: (name: string): Promise<CategoryCheckResult> =>
    api.get<CategoryCheckResult>(`/categories/check?name=${encodeURIComponent(name)}`),

  createCategory: (payload: CreateCategoryPayload): Promise<Category> =>
    api.post<Category>('/categories', payload),
};
