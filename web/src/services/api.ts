import { API_BASE_URL, REFRESH_TOKEN_STORAGE_KEY, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/lib/constants';
import type { ApiError, AuthResponse } from '@/types';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Configured fetch wrapper with JWT auth header injection and auto-refresh mechanism.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) : null;

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data: AuthResponse = await refreshRes.json();
            const newAccessToken = data.accessToken || data.token;
            const newRefreshToken = data.refreshToken || refreshToken;

            localStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken);
            localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
            if (data.user) {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
            }

            processQueue(null, newAccessToken);
            isRefreshing = false;

            // Retry original request with new access token
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
            const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });

            if (!retryRes.ok) {
              const retryError: ApiError = await retryRes.json().catch(() => ({
                status: retryRes.status,
                error: 'UNAUTHORIZED',
                message: retryRes.statusText,
                timestamp: new Date().toISOString(),
                path: endpoint,
              }));
              throw retryError;
            }

            return retryRes.json() as Promise<T>;
          } else {
            // Refresh token expired or invalid
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            processQueue(new Error('Refresh token expired'), null);
            isRefreshing = false;
          }
        } catch (err) {
          processQueue(err, null);
          isRefreshing = false;
        }
      } else {
        // Queue parallel requests until refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(newToken => {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
          return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers }).then(res => res.json() as Promise<T>);
        });
      }
    }
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      status: response.status,
      error: 'UNKNOWN_ERROR',
      message: response.statusText,
      timestamp: new Date().toISOString(),
      path: endpoint,
    }));
    throw error;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),

  patch: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
