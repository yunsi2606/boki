export type ChatActionType =
  | 'NONE'
  | 'VIEW_BOOK'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'APPLY_VOUCHER'
  | 'COPY_VOUCHER'
  | 'VIEW_ORDER'
  | 'TRACK_ORDER'
  | 'GO_TO_CHECKOUT'
  | 'NAVIGATE'
  | 'BOOK_LIST'
  | 'BOOK_COMPARE'
  | 'ORDER_INFO'
  | 'VOUCHER_LIST'
  | 'ADMIN_METRIC'
  | 'DAILY_BRIEFING'
  | 'REQUIRE_CONFIRMATION'
  | 'QUICK_ACTIONS';

export interface ChatAction {
  type: ChatActionType;
  label: string;
  payload: Record<string, any>;
  icon?: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface BookCardData {
  id: string;
  title: string;
  slug?: string;
  author: string;
  price: number;
  originalPrice?: number;
  coverUrl?: string;
  rating: number;
  stock: number;
  isPreOrder?: boolean;
  actions?: ChatAction[];
}

export interface OrderCardData {
  id: string;
  status: string;
  totalAmount: number;
  shippingFee?: number;
  shippingAddress?: string;
  carrierName?: string;
  carrierStatus?: string;
  trackingNumber?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
  items?: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
}

export interface VoucherCardData {
  code: string;
  discountType: string;
  discountAmount: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  title: string;
  description?: string;
  endDate?: string;
  eligible?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'BOT' | 'SYSTEM';
  text: string;
  actionType?: ChatActionType;
  cards?: any[];
  actions?: ChatAction[];
  suggestions?: string[];
  timestamp: string;
  latencyMs?: number;
  logId?: number;
  feedback?: 'LIKE' | 'DISLIKE';
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  currentPath?: string;
}

export interface ChatResponse {
  id: string;
  sender: string;
  text: string;
  actionType: ChatActionType;
  cards: any[];
  actions: ChatAction[];
  suggestions: string[];
  timestamp: string;
  latencyMs: number;
}
