import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { CategoryResponse } from '../types/category';

export async function getCategoriesWithPosts(): Promise<CategoryResponse[]> {
    const response = await apiClient<ApiResponse<CategoryResponse[]>>(
        '/api/v1/categories/with-posts'
    );

    return response.data;
}
