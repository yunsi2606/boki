import { api } from './api';
import type { BlogPost, CreateBlogPayload, UpdateBlogPayload, BlogCategory, CreateBlogCategoryPayload } from '@/types/blog';

export const blogService = {
  // ===== Public (Storefront) =====

  getCategories: async (): Promise<BlogCategory[]> => {
    return api.get<BlogCategory[]>('/blogs/categories');
  },

  searchBlogs: async (category?: string, search?: string, page = 0, size = 12): Promise<BlogPost[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('size', size.toString());
    return api.get<BlogPost[]>(`/blogs?${params.toString()}`);
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

  getAdminBlogs: async (search?: string, page = 0, size = 50): Promise<BlogPost[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
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
