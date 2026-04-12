import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { LoginRequest, AuthResponse } from '../types/auth';

export async function login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient<ApiResponse<AuthResponse>>('/api/v1/auth/login',
        {
            method: 'POST',
            body: JSON.stringify(data),
        }
    );
    return response.data;
}

export async function logout(): Promise<void> {
    await apiClient<void>('/api/v1/auth/logout', {
        method: 'POST'
    });
}