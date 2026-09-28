import { api } from './api';
import type { BlogPost, CreateBlogPayload, UpdateBlogPayload, BlogCategory, CreateBlogCategoryPayload } from '@/types/blog';

export const blogService = {
  // ===== Public (Storefront) =====

  getCategories: async (): Promise<BlogCategory[]> => {
    return api.get<BlogCategory[]>('/blogs/categories');
  },

  searchBlogs: async (category?: string, search?: string, page = 0, size = 12, type?: string): Promise<BlogPost[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return api.get<BlogPost[]>(`/blogs?${params.toString()}`);
  },

  getPreviews: async (options?: { category?: string; search?: string; page?: number; size?: number }): Promise<BlogPost[]> => {
    const params = new URLSearchParams();
    params.append('type', 'PREVIEW');
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);
    params.append('page', (options?.page ?? 0).toString());
    params.append('size', (options?.size ?? 12).toString());
    return api.get<BlogPost[]>(`/blogs?${params.toString()}`);
  },

  getBookPreviews: async (bookIdOrSlug: string): Promise<BlogPost[]> => {
    return api.get<BlogPost[]>(`/books/${bookIdOrSlug}/previews`);
  },

  getFeaturedBlogs: async (limit = 3): Promise<BlogPost[]> => {
    return api.get<BlogPost[]>(`/blogs/featured?limit=${limit}`);
  },

  getBlogBySlug: async (slug: string): Promise<BlogPost> => {
    return api.get<BlogPost>(`/blogs/${slug}`);
  },

  incrementViews: async (slug: string): Promise<void> => {
    return api.post<void>(`/blogs/${slug}/views`, {});
  },

  // ===== Admin =====

  getAdminBlogs: async (search?: string, page = 0, size = 50, type?: string): Promise<BlogPost[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type && type !== 'ALL') params.append('type', type);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return api.get<BlogPost[]>(`/admin/blogs?${params.toString()}`);
  },

  getAdminBlogById: async (id: string): Promise<BlogPost> => {
    return api.get<BlogPost>(`/admin/blogs/${id}`);
  },

  createBlog: async (payload: CreateBlogPayload): Promise<BlogPost> => {
    return api.post<BlogPost>('/admin/blogs', payload);
  },

  updateBlog: async (id: string, payload: UpdateBlogPayload): Promise<BlogPost> => {
    return api.put<BlogPost>(`/admin/blogs/${id}`, payload);
  },

  changeStatus: async (id: string, status: string): Promise<BlogPost> => {
    return api.patch<BlogPost>(`/admin/blogs/${id}/status`, { status });
  },

  toggleFeatured: async (id: string): Promise<BlogPost> => {
    return api.patch<BlogPost>(`/admin/blogs/${id}/featured`, {});
  },

  deleteBlog: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/blogs/${id}`);
  },

  createCategory: async (payload: CreateBlogCategoryPayload): Promise<BlogCategory> => {
    return api.post<BlogCategory>('/admin/blogs/categories', payload);
  },
};
