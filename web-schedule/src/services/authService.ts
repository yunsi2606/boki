import { ScheduleUser } from '@/types/auth';

const TOKEN_KEY = 'boki_auth_token';
const REFRESH_TOKEN_KEY = 'boki_refresh_token';
const USER_KEY = 'boki_user';

export const authService = {
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getStoredUser(): ScheduleUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getStoreBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_STORE_URL) {
      return process.env.NEXT_PUBLIC_STORE_URL;
    }
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return 'https://boki.nhatcuong.io.vn';
    }
    return 'http://localhost:3000';
  },

  getLoginUrl(returnUrl?: string): string {
    const storeUrl = this.getStoreBaseUrl();
    const dest =
      returnUrl ||
      (typeof window !== 'undefined'
        ? window.location.href
        : process.env.NEXT_PUBLIC_SCHEDULE_URL || 'https://boki-vlpo.vercel.app');
    return `${storeUrl}/login?returnUrl=${encodeURIComponent(dest)}`;
  },

  getRegisterUrl(returnUrl?: string): string {
    const storeUrl = this.getStoreBaseUrl();
    const dest =
      returnUrl ||
      (typeof window !== 'undefined'
        ? window.location.href
        : process.env.NEXT_PUBLIC_SCHEDULE_URL || 'https://boki-vlpo.vercel.app');
    return `${storeUrl}/register?returnUrl=${encodeURIComponent(dest)}`;
  },

  redirectToLogin(returnUrl?: string) {
    if (typeof window === 'undefined') return;
    window.location.href = this.getLoginUrl(returnUrl);
  },

  handleSsoCallback(): boolean {
    if (typeof window === 'undefined') return false;
    const url = new URL(window.location.href);
    const ssoToken = url.searchParams.get('sso_token');
    const ssoRefreshToken = url.searchParams.get('sso_refresh_token');
    const ssoUserRaw = url.searchParams.get('sso_user');

    if (ssoToken) {
      localStorage.setItem(TOKEN_KEY, ssoToken);
      if (ssoRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, ssoRefreshToken);
      }
      if (ssoUserRaw) {
        try {
          const decoded = decodeURIComponent(ssoUserRaw);
          localStorage.setItem(USER_KEY, decoded);
        } catch {
          // Ignore decoding errors
        }
      }
      url.searchParams.delete('sso_token');
      url.searchParams.delete('sso_refresh_token');
      url.searchParams.delete('sso_user');
      window.history.replaceState(
        {},
        '',
        url.pathname + (url.search ? url.search : '') + url.hash
      );
      window.dispatchEvent(new Event('boki_auth_change'));
      return true;
    }
    return false;
  },

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('boki_auth_change'));
  },

  hasPurchasedBook(bookIdOrSlug: string, user: ScheduleUser | null): boolean {
    if (!user) return false;
    if (typeof window !== 'undefined') {
      const purchasedRaw = localStorage.getItem('boki_user_purchases');
      if (purchasedRaw) {
        try {
          const list: string[] = JSON.parse(purchasedRaw);
          if (list.includes(bookIdOrSlug)) return true;
        } catch {
          // ignore
        }
      }
    }
    return user.role === 'ADMIN' || user.role === 'BUYER';
  },
};
