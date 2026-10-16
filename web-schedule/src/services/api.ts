const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://api-boki.nhatcuong.io.vn/api');

export async function scheduleApiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('boki_auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
