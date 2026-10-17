/**
 * Local Docker Backend API Endpoint
 * Dedicated exclusively to the local Docker Spring Boot backend (http://localhost:8080/api).
 * Failover to external secondary/render cloud backends has been completely removed.
 */

export const LOCAL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const PRIMARY_API_URL = LOCAL_API_URL;
export const BACKUP_API_URL = LOCAL_API_URL;

// Clean up any legacy failover cache from previous sessions
if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem('boki_active_api_target');
    sessionStorage.removeItem('boki_api_failover_time');
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Returns the active local backend API base URL
 */
export function getActiveApiBaseUrl(): string {
  return LOCAL_API_URL;
}

/**
 * Legacy stubs maintained for backward-compatibility with existing imports.
 */
export function switchApiToBackup(): void {
  // Disabled: only local Docker backend is used
}

export function switchApiToPrimary(): void {
  // Disabled: always running on local Docker backend
}

/**
 * Direct fetch against the local Docker backend.
 */
export async function fetchWithFailover(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return fetch(`${LOCAL_API_URL}${normalizedEndpoint}`, options);
}
