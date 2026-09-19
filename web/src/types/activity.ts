export type ActivityEventType =
  | 'PAGE_VIEW'
  | 'SEARCH'
  | 'VIEW_BOOK'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'UPDATE_CART_QTY'
  | 'INITIATE_CHECKOUT'
  | 'APPLY_VOUCHER'
  | 'PLACE_ORDER'
  | 'CANCEL_ORDER'
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'ADMIN_ACTION';

export type ActivityEventCategory =
  | 'NAVIGATION'
  | 'ENGAGEMENT'
  | 'ECOMMERCE'
  | 'AUTH'
  | 'ADMIN';

export interface UserActivity {
  id: string;
  sessionId: string;
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  eventType: ActivityEventType;
  eventCategory: ActivityEventCategory;
  pagePath?: string | null;
  pageTitle?: string | null;
  referrerUrl?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  metadataJson?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceType: string;
  browser?: string | null;
  os?: string | null;
  durationSeconds: number;
  createdAt: string;
}

export interface ActivityAnalytics {
  activeSessions30m: number;
  totalEventsToday: number;
  viewBookCountToday: number;
  addToCartCountToday: number;
  initiateCheckoutCountToday: number;
  placeOrderCountToday: number;
  cartConversionRate: number;
  orderConversionRate: number;
  topSearchKeywords: string[];
  topViewedBooks: string[];
  deviceBreakdown: Record<string, number>;
}

export interface RecordActivityPayload {
  sessionId?: string;
  eventType: ActivityEventType | string;
  eventCategory?: ActivityEventCategory | string;
  pagePath?: string;
  pageTitle?: string;
  referrerUrl?: string;
  targetId?: string;
  targetName?: string;
  metadataJson?: string;
  durationSeconds?: number;
}

export interface BatchActivityPayload {
  sessionId: string;
  events: RecordActivityPayload[];
}

export interface ActivityFilterParams {
  eventType?: string;
  eventCategory?: string;
  sessionId?: string;
  userId?: string;
  search?: string;
  fromTime?: string;
  toTime?: string;
  page?: number;
  size?: number;
}

export interface PaginatedActivitiesResponse {
  content: UserActivity[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
