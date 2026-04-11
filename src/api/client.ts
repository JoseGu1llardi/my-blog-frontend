const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiClient<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const error = await response.json();
        throw error;
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}