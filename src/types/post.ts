import type { AuthorSummaryResponse } from "./author";
import type { CategoryResponse } from "./category";

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export interface PostSummaryResponse {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string;
  readingTimeMinutes: number;
  author: AuthorSummaryResponse;
}

export interface PostResponse {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  status: PostStatus;
  publishedAt: string;
  viewCount: number;
  readingTimeMinutes: number;
  author: AuthorSummaryResponse;
  categories: CategoryResponse[];
  metaDescription: string;
  metaKeywords: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostCreateRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: PostStatus;
  categoryIds?: number[];
  metaDescription?: string;
  metaKeywords?: string;
}

export interface PostUpdateRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryIds?: number[];
  metaDescription?: string;
  metaKeywords?: string;
}