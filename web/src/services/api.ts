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

export class ApiRequestError extends Error {
  status: number;
  error: string;
  timestamp?: string;
  path?: string;

  constructor(data: ApiError) {
    super(data.message || data.error || 'Yêu cầu API thất bại');
    this.name = 'ApiRequestError';
    this.status = data.status;
    this.error = data.error;
    this.timestamp = data.timestamp;
    this.path = data.path;
  }
}

interface RequestOptions extends RequestInit {
  cacheTtlMs?: number;
  bypassCache?: boolean;
}

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<unknown>>();

// In-memory response cache for GET requests
const responseCache = new Map<string, CacheItem<unknown>>();

/**
 * Default cache TTL for frequently accessed lookup endpoints (in milliseconds)
 */
function getDefaultCacheTtl(endpoint: string): number {
  if (endpoint.includes('/categories')) return 180_000; // 3 minutes
  if (endpoint.includes('/vouchers')) return 60_000;    // 1 minute
  if (endpoint.startsWith('/books?') || endpoint === '/books') return 10_000; // 10 seconds
  if (endpoint.startsWith('/blogs?') || endpoint === '/blogs') return 10_000; // 10 seconds
  return 0; // Default: no cache beyond in-flight deduplication
}

/**
 * Invalidate cache entries matching a prefix or pattern.
 */
function invalidateCache(pattern?: string) {
  if (!pattern) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
}

/**
 * Configured fetch wrapper with JWT auth header injection, auto-refresh mechanism,
 * in-flight request deduplication, and client-side memory caching.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  const cacheKey = `${method}:${endpoint}:${token ? 'auth' : 'anon'}`;

  // Check TTL cache for GET requests
  if (method === 'GET' && !options.bypassCache) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T;
    }
  }

  // Deduplicate concurrent in-flight requests (solves React 19 / StrictMode double-fetch)
  if (method === 'GET' && !options.bypassCache && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  const fetchPromise = (async (): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
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
              credentials: 'include',
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
                credentials: 'include',
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
                throw new ApiRequestError(retryError);
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
      throw new ApiRequestError(error);
    }

    const data = (await response.json()) as T;

    // Cache successful GET responses if TTL specified or endpoint has default TTL
    if (method === 'GET' && !options.bypassCache) {
      const ttl = options.cacheTtlMs ?? getDefaultCacheTtl(endpoint);
      if (ttl > 0) {
        responseCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + ttl,
        });
      }
    }

    return data;
  })();

  if (method === 'GET' && !options.bypassCache) {
    inFlightRequests.set(cacheKey, fetchPromise);
    fetchPromise.finally(() => inFlightRequests.delete(cacheKey));
  }

  return fetchPromise;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown = {}, options?: RequestOptions) => {
    // Invalidate caches when mutations occur
    if (endpoint.includes('/books')) invalidateCache('/books');
    if (endpoint.includes('/blogs')) invalidateCache('/blogs');
    if (endpoint.includes('/vouchers')) invalidateCache('/vouchers');
    return apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  },

  put: <T>(endpoint: string, body: unknown = {}, options?: RequestOptions) => {
    if (endpoint.includes('/books')) invalidateCache('/books');
    if (endpoint.includes('/blogs')) invalidateCache('/blogs');
    if (endpoint.includes('/vouchers')) invalidateCache('/vouchers');
    return apiFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  },

  delete: <T>(endpoint: string, options?: RequestOptions) => {
    if (endpoint.includes('/books')) invalidateCache('/books');
    if (endpoint.includes('/blogs')) invalidateCache('/blogs');
    if (endpoint.includes('/vouchers')) invalidateCache('/vouchers');
    return apiFetch<T>(endpoint, { method: 'DELETE', ...options });
  },

  patch: <T>(endpoint: string, body: unknown = {}, options?: RequestOptions) => {
    if (endpoint.includes('/books')) invalidateCache('/books');
    if (endpoint.includes('/blogs')) invalidateCache('/blogs');
    if (endpoint.includes('/vouchers')) invalidateCache('/vouchers');
    return apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    });
  },

  clearCache: (pattern?: string) => invalidateCache(pattern),
};
