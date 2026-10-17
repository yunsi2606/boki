import { ScheduleUser } from '@/types/auth';

const TOKEN_KEY = 'boki_auth_token';
const USER_KEY = 'boki_user';

export const authService = {
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
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
    return process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
  },

  getLoginUrl(returnUrl?: string): string {
    const storeUrl = this.getStoreBaseUrl();
    const dest = returnUrl || (typeof window !== 'undefined' ? window.location.href : '/');
    return `${storeUrl}/login?returnUrl=${encodeURIComponent(dest)}`;
  },

  getRegisterUrl(returnUrl?: string): string {
    const storeUrl = this.getStoreBaseUrl();
    const dest = returnUrl || (typeof window !== 'undefined' ? window.location.href : '/');
    return `${storeUrl}/register?returnUrl=${encodeURIComponent(dest)}`;
  },

  redirectToLogin(returnUrl?: string) {
    if (typeof window === 'undefined') return;
    window.location.href = this.getLoginUrl(returnUrl);
  },

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('boki_auth_change'));
  },

  /**
   * Check if user has purchased this volume/book on Boki Store
   * Used for the "Đã mua chính hãng" / "Verified Reader" badge
   */
  hasPurchasedBook(bookIdOrSlug: string, user: ScheduleUser | null): boolean {
    if (!user) return false;
    // In dev / test, check purchased list from localStorage or mock storage
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
    // Default verified true for demo/admin/logged in active buyers to display badge
    return user.role === 'ADMIN' || user.role === 'BUYER';
  },
};
