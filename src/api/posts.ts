import { apiClient } from './client';
import type { ApiResponse, PageResponse } from '../types/api';
import type { PostResponse, PostSummaryResponse, PostCreateRequest, PostUpdateRequest } from '../types/post';

export async function getPosts(page = 0, size = 10): Promise<PageResponse<PostSummaryResponse>> {
    const response = await apiClient<ApiResponse<PageResponse<PostSummaryResponse>>>(
        `/api/v1/posts?page=${page}&size=${size}`
    );
    return response.data;
}

export async function getMyPosts(page = 0, size = 10): Promise<PageResponse<PostResponse>> {
    const response = await apiClient<ApiResponse<PageResponse<PostResponse>>>(
        `/api/v1/posts/my-posts?page=${page}&size=${size}`
    );

    return response.data;
}

export async function getPost(slug: string): Promise<PostResponse> {
    const response = await apiClient<ApiResponse<PostResponse>>(
        `/api/v1/posts/${slug}`
    );

    return response.data;
}

export async function createPost(data: PostCreateRequest): Promise<PostResponse> {
    const response = await apiClient<ApiResponse<PostResponse>>(
        `/api/v1/posts`,
        {
            method: 'POST',
            body: JSON.stringify(data)
        }
    )

    return response.data;
}

export async function updatePost(id: number, data: PostUpdateRequest): Promise<PostResponse> {
    const response = await apiClient<ApiResponse<PostResponse>>(
        `/api/v1/posts/${id}`,
        {
            method: 'PUT',
            body: JSON.stringify(data)
        }
    );

    return response.data;
}

export async function publishPost(id: number): Promise<void> {
    await apiClient<void>(`/api/v1/posts/${id}/publish`, {
        method: 'PATCH',
    });
}

export async function unpublishPost(id: number): Promise<void> {
    await apiClient<void>(`/api/v1/posts/${id}/unpublish`, {
        method: 'PATCH',
    }); 
}

export async function deletePost(id: number): Promise<void> {
    await apiClient<void>(`/api/v1/posts/${id}`, {
        method: 'DELETE',
    });
}

