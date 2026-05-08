import { apiClient } from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { PostSummaryResponse } from '../types/post';

export async function searchPosts(query: string, page = 0, size = 10): Promise<PageResponse<PostSummaryResponse>> {
    const response = await apiClient<ApiResponse<PageResponse<PostSummaryResponse>>>(
        `/api/v1/posts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    return response.data;
}