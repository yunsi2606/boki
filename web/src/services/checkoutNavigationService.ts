import type { CartItem } from '@/types';

const CHECKOUT_STATE_STORAGE_KEY = 'boki_checkout_session_state';

export interface CheckoutNavigationState {
  items: CartItem[];
  voucherCode?: string;
  source?: 'cart' | 'buy_now' | 'reorder';
  timestamp: number;
}

/**
 * Service to manage clean state transition to /checkout without leaking
 * sensitive order details, item IDs, or prices onto the URL query string.
 * Uses History API state + ephemeral sessionStorage backup for smooth reload resilience.
 */
export const checkoutNavigationService = {
  /**
   * Saves checkout items to ephemeral state and navigates cleanly to /checkout
   */
  navigateToCheckout: (
    router: { push: (url: string) => void },
    items: CartItem[],
    options?: { voucherCode?: string; source?: 'cart' | 'buy_now' | 'reorder' }
  ) => {
    if (typeof window === 'undefined') return;

    const statePayload: CheckoutNavigationState = {
      items,
      voucherCode: options?.voucherCode,
      source: options?.source || 'cart',
      timestamp: Date.now(),
    };

    try {
      // 1. Persist in HTML5 History state without query params
      if (window.history && window.history.replaceState) {
        const currentUrl = window.location.href;
        window.history.replaceState({ ...window.history.state, bokiCheckout: statePayload }, '', currentUrl);
      }

      // 2. Persist in sessionStorage for page refresh resilience (expires after 1 hour)
      sessionStorage.setItem(CHECKOUT_STATE_STORAGE_KEY, JSON.stringify(statePayload));
    } catch (e) {
      console.warn('Could not serialize checkout state to storage:', e);
    }

    // Clean URL navigation without exposing cart details in URL query parameters
    router.push('/checkout');
  },

  /**
   * Retrieves checkout items from current navigation state or sessionStorage backup
   */
  getCheckoutState: (): CheckoutNavigationState | null => {
    if (typeof window === 'undefined') return null;

    try {
      // 1. Check window.history.state first
      const histState = window.history?.state?.bokiCheckout as CheckoutNavigationState | undefined;
      if (histState && Array.isArray(histState.items) && histState.items.length > 0) {
        return histState;
      }

      // 2. Check sessionStorage fallback
      const stored = sessionStorage.getItem(CHECKOUT_STATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CheckoutNavigationState;
        // Expire after 1 hour
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000 && parsed.items?.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading checkout state:', e);
    }

    return null;
  },

  /**
   * Clears state upon order completion
   */
  clearCheckoutState: () => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(CHECKOUT_STATE_STORAGE_KEY);
      if (window.history && window.history.state?.bokiCheckout) {
        const state = { ...window.history.state };
        delete state.bokiCheckout;
        window.history.replaceState(state, '', window.location.href);
      }
    } catch (e) {
      console.warn('Error clearing checkout state:', e);
    }
  },
};
