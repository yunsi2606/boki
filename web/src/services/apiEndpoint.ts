/**
 * Smart API Endpoint Resolver with Automatic Failover
 * Primary: Cloudflare Tunnel / Local Backend (api-boki.nhatcuong.io.vn)
 * Backup: Render Cloud Backend (boki-api.onrender.com)
 */

export const PRIMARY_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://api-boki.nhatcuong.io.vn/api');

export const BACKUP_API_URL =
  process.env.NEXT_PUBLIC_BACKUP_API_URL || 'https://boki-api.onrender.com/api';

const STORAGE_KEY = 'boki_active_api_target';
const FAILOVER_TIMESTAMP_KEY = 'boki_api_failover_time';
const REPROBE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes before re-checking primary

let inMemoryTarget: 'primary' | 'backup' = 'primary';

export function getActiveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const savedTarget = sessionStorage.getItem(STORAGE_KEY);
    const savedTime = Number(sessionStorage.getItem(FAILOVER_TIMESTAMP_KEY) || '0');

    if (savedTarget === 'backup') {
      // Periodic probe: retry primary after reprobe interval
      if (savedTime > 0 && Date.now() - savedTime > REPROBE_INTERVAL_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(FAILOVER_TIMESTAMP_KEY);
        inMemoryTarget = 'primary';
        return PRIMARY_API_URL;
      }
      return BACKUP_API_URL;
    }
  }

  return inMemoryTarget === 'backup' ? BACKUP_API_URL : PRIMARY_API_URL;
}

export function switchApiToBackup(reason?: unknown): void {
  inMemoryTarget = 'backup';

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, 'backup');
    sessionStorage.setItem(FAILOVER_TIMESTAMP_KEY, String(Date.now()));
    console.warn(
      '[Boki API] Primary backend unreachable. Switched failover to Render backup:',
      BACKUP_API_URL,
      reason ?? ''
    );
  }
}

export function switchApiToPrimary(): void {
  inMemoryTarget = 'primary';

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(FAILOVER_TIMESTAMP_KEY);
    console.info('[Boki API] Primary backend restored:', PRIMARY_API_URL);
  }
}

/**
 * Execute a fetch with automatic failover to backup if primary is down.
 */
export async function fetchWithFailover(
  endpoint: string,
  options: RequestInit = {},
  primaryTimeoutMs = 1500
): Promise<Response> {
  const currentBase = getActiveApiBaseUrl();

  // If already running on backup server, call directly
  if (currentBase === BACKUP_API_URL) {
    return fetch(`${BACKUP_API_URL}${endpoint}`, options);
  }

  // Attempt primary with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), primaryTimeoutMs);

  try {
    const response = await fetch(`${PRIMARY_API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // If tunnel or host returns server error/down
    if ([502, 503, 504, 530].includes(response.status)) {
      switchApiToBackup(`HTTP ${response.status}`);
      return fetch(`${BACKUP_API_URL}${endpoint}`, options);
    }

    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    // Timeout or network connection refused (Docker offline)
    switchApiToBackup(err);
    return fetch(`${BACKUP_API_URL}${endpoint}`, options);
  }
}
