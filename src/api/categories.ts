import { apiClient } from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { CategoryResponse } from '../types/category';
import type { PostSummaryResponse } from '../types/post';

export async function getCategoriesWithPosts(): Promise<CategoryResponse[]> {
    const response = await apiClient<ApiResponse<CategoryResponse[]>>(
        '/api/v1/categories/with-posts'
    );
    return response.data;
}

export async function getCategory(slug: string): Promise<CategoryResponse> {
    const response = await apiClient<ApiResponse<CategoryResponse>>(
        `/api/v1/categories/${slug}`
    );
    return response.data;
}

export async function getPostsByCategory(slug: string, page = 0, size = 10): Promise<PageResponse<PostSummaryResponse>> {
    const response = await apiClient<ApiResponse<PageResponse<PostSummaryResponse>>>(
        `/api/v1/posts/category/${slug}?page=${page}&size=${size}`
    );
    return response.data;
}