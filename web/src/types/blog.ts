export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type BlogType = 'REGULAR' | 'PREVIEW';

export interface BookSummary {
  id: string;
  title: string;
  slug?: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  viewsCount?: number;
  coverImage?: string;
  categoryId?: number;
}

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
  postType?: BlogType;
  viewsCount: number;
  likesCount: number;
  readingTimeMinutes: number;
  isFeatured: boolean;
  linkedBooks?: BookSummary[];
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
  postType?: BlogType;
  linkedBookIds?: string[];
  publish?: boolean;
}

export interface UpdateBlogPayload {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string | null;
  category?: string;
  tags?: string[];
  postType?: BlogType;
  linkedBookIds?: string[];
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
