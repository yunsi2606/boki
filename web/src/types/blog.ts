export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  effectiveCoverImage: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  viewsCount: number;
  likesCount: number;
  readingTimeMinutes: number;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPayload {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string | null;
  category?: string;
  tags?: string[];
  publish?: boolean;
}

export interface UpdateBlogPayload {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string | null;
  category?: string;
  tags?: string[];
  status?: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
}

export interface CreateBlogCategoryPayload {
  name: string;
  description?: string;
}
