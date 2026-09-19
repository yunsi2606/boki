import { API_BASE_URL } from '@/lib/constants';
import type { RecordActivityPayload, BatchActivityPayload } from '@/types/activity';

const SESSION_STORAGE_KEY = 'boki_session_id';
const FLUSH_INTERVAL_MS = 3000;
const MAX_BUFFER_SIZE = 5;

class ActivityTracker {
  private sessionId: string = '';
  private buffer: RecordActivityPayload[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSession();
      this.setupUnloadHandler();
    }
  }

  private initSession() {
    try {
      let stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        stored = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        sessionStorage.setItem(SESSION_STORAGE_KEY, stored);
      }
      this.sessionId = stored;
      this.isInitialized = true;
    } catch (e) {
      this.sessionId = 'sess_' + Date.now();
    }
  }

  public getSessionId(): string {
    if (!this.sessionId) {
      this.initSession();
    }
    return this.sessionId;
  }

  private setupUnloadHandler() {
    const handleUnload = () => {
      this.flushBeacon();
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushBeacon();
      }
    });

    window.addEventListener('pagehide', handleUnload);
  }

  /**
   * Enqueue an event into the buffer with debounced flush
   */
  public track(event: RecordActivityPayload) {
    if (typeof window === 'undefined') return;

    const payload: RecordActivityPayload = {
      ...event,
      sessionId: event.sessionId || this.getSessionId(),
      pagePath: event.pagePath || window.location.pathname + window.location.search,
      pageTitle: event.pageTitle || document.title,
      referrerUrl: event.referrerUrl || document.referrer || undefined,
    };

    this.buffer.push(payload);

    if (this.buffer.length >= MAX_BUFFER_SIZE) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  /**
   * Flush queued events asynchronously via fetch
   */
  public async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.buffer.length === 0) return;

    const eventsToSend = [...this.buffer];
    this.buffer = [];

    const batchPayload: BatchActivityPayload = {
      sessionId: this.getSessionId(),
      events: eventsToSend,
    };

    try {
      await fetch(`${API_BASE_URL}/activities/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(batchPayload),
        keepalive: true,
      });
    } catch (err) {
      console.warn('[ActivityTracker] Failed to flush events:', err);
    }
  }

  /**
   * Synchronous beacon flush for page dismissal (pagehide/visibilitychange)
   */
  private flushBeacon() {
    if (this.buffer.length === 0) return;

    const eventsToSend = [...this.buffer];
    this.buffer = [];

    const batchPayload: BatchActivityPayload = {
      sessionId: this.getSessionId(),
      events: eventsToSend,
    };

    try {
      const blob = new Blob([JSON.stringify(batchPayload)], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${API_BASE_URL}/activities/batch`, blob);
      } else {
        fetch(`${API_BASE_URL}/activities/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(batchPayload),
          keepalive: true,
        });
      }
    } catch (err) {
      console.warn('[ActivityTracker] Beacon flush failed:', err);
    }
  }

  // --- Convenience Tracking Helpers ---

  public trackPageView(path?: string, title?: string, referrer?: string) {
    this.track({
      eventType: 'PAGE_VIEW',
      eventCategory: 'NAVIGATION',
      pagePath: path || (typeof window !== 'undefined' ? window.location.pathname : ''),
      pageTitle: title || (typeof document !== 'undefined' ? document.title : ''),
      referrerUrl: referrer,
    });
  }

  public trackSearch(keyword: string, resultCount?: number) {
    this.track({
      eventType: 'SEARCH',
      eventCategory: 'ENGAGEMENT',
      targetName: keyword.trim(),
      metadataJson: JSON.stringify({ keyword: keyword.trim(), resultCount: resultCount ?? 0 }),
    });
  }

  public trackBookView(bookId: string, title: string, price?: number, category?: string) {
    this.track({
      eventType: 'VIEW_BOOK',
      eventCategory: 'ENGAGEMENT',
      targetId: bookId,
      targetName: title,
      metadataJson: JSON.stringify({ price, category }),
    });
  }

  public trackCartAction(
    action: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'UPDATE_CART_QTY',
    bookId: string,
    title: string,
    price?: number,
    quantity?: number
  ) {
    this.track({
      eventType: action,
      eventCategory: 'ECOMMERCE',
      targetId: bookId,
      targetName: title,
      metadataJson: JSON.stringify({ price, quantity }),
    });
  }

  public trackCheckoutStep(step: string, metadata?: Record<string, any>) {
    this.track({
      eventType: 'INITIATE_CHECKOUT',
      eventCategory: 'ECOMMERCE',
      targetName: step,
      metadataJson: metadata ? JSON.stringify(metadata) : undefined,
    });
  }

  public trackOrderPlaced(
    orderId: string,
    totalAmount: number,
    paymentMethod?: string,
    itemCount?: number,
    extraMetadata?: Record<string, any>
  ) {
    this.track({
      eventType: 'PLACE_ORDER',
      eventCategory: 'ECOMMERCE',
      targetId: orderId,
      targetName: `Đơn hàng #${orderId.slice(0, 8).toUpperCase()}`,
      metadataJson: JSON.stringify({ totalAmount, paymentMethod, itemCount, ...(extraMetadata || {}) }),
    });
  }

  public trackVoucherApplied(voucherCode: string, success: boolean, discountAmount?: number) {
    this.track({
      eventType: 'APPLY_VOUCHER',
      eventCategory: 'ECOMMERCE',
      targetName: voucherCode,
      metadataJson: JSON.stringify({ voucherCode, success, discountAmount }),
    });
  }

  public trackAuth(type: 'LOGIN' | 'LOGOUT' | 'REGISTER', email?: string) {
    this.track({
      eventType: type,
      eventCategory: 'AUTH',
      targetName: email,
      metadataJson: JSON.stringify({ email }),
    });
  }

  public trackAdminAction(action: string, targetName: string, metadata?: Record<string, any>) {
    this.track({
      eventType: 'ADMIN_ACTION',
      eventCategory: 'ADMIN',
      targetName: `${action}: ${targetName}`,
      metadataJson: metadata ? JSON.stringify(metadata) : undefined,
    });
  }
}

export const activityTracker = new ActivityTracker();

