const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://api-boki.nhatcuong.io.vn/api');

const TOKEN_KEY = 'boki_auth_token';
const REFRESH_TOKEN_KEY = 'boki_refresh_token';
const USER_KEY = 'boki_user';

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
}

function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('boki_auth_change'));
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const json = await response.json();
    return json.message || json.error || `API error ${response.status}`;
  } catch {
    return response.statusText
      ? `API error ${response.status}: ${response.statusText}`
      : `API error ${response.status}`;
  }
}

export async function scheduleApiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Expiration and Auto-Refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

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
            const data = await refreshRes.json();
            const newAccessToken = data.accessToken || data.token;
            const newRefreshToken = data.refreshToken || refreshToken;

            localStorage.setItem(TOKEN_KEY, newAccessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
            if (data.user) {
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
            window.dispatchEvent(new Event('boki_auth_change'));

            processQueue(null, newAccessToken);
            isRefreshing = false;

            // Retry original request with new token
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });

            if (!retryRes.ok) {
              const errMsg = await extractErrorMessage(retryRes);
              throw new Error(errMsg);
            }

            if (retryRes.status === 204 || retryRes.headers.get('content-length') === '0') {
              return undefined as T;
            }
            const text = await retryRes.text();
            return (text ? JSON.parse(text) : undefined) as T;
          } else {
            clearAuthStorage();
            const err = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            processQueue(err, null);
            isRefreshing = false;
            throw err;
          }
        } catch (err) {
          isRefreshing = false;
          processQueue(err, null);
          throw err;
        }
      } else {
        // Wait for ongoing refresh
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(async (newToken) => {
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          if (!retryRes.ok) {
            const errMsg = await extractErrorMessage(retryRes);
            throw new Error(errMsg);
          }
          if (retryRes.status === 204 || retryRes.headers.get('content-length') === '0') {
            return undefined as T;
          }
          const text = await retryRes.text();
          return (text ? JSON.parse(text) : undefined) as T;
        });
      }
    } else {
      clearAuthStorage();
    }
  }

  if (!response.ok) {
    const errMsg = await extractErrorMessage(response);
    throw new Error(errMsg);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
