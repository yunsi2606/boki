interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

// In-flight request deduplication map
export const inFlightRequests = new Map<string, Promise<unknown>>();

// In-memory response cache for GET requests
export const responseCache = new Map<string, CacheItem<unknown>>();

/**
 * Default cache TTL for frequently accessed lookup endpoints (in milliseconds)
 */
export function getDefaultCacheTtl(endpoint: string): number {
  if (endpoint.includes('/categories')) return 180_000; // 3 minutes
  if (endpoint.includes('/vouchers')) return 60_000;    // 1 minute
  if (endpoint.startsWith('/books?') || endpoint === '/books') return 10_000; // 10 seconds
  if (endpoint.startsWith('/blogs?') || endpoint === '/blogs') return 10_000; // 10 seconds
  if (endpoint.startsWith('/release-schedules')) return 10_000; // 10 seconds
  return 0; // Default: no cache beyond in-flight deduplication
}

/**
 * Invalidate cache entries matching a prefix or pattern.
 */
export function invalidateCache(pattern?: string): void {
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
