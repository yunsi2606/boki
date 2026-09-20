export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string | null;
  phoneVerified: boolean;
  avatarUrl: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  emailVerified: boolean;
  memberTier?: 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | string;
  totalSpent?: number;
  loyaltyPoints?: number;
  tierUpgradedAt?: string;
  tierExpiresAt?: string;
  cycleSpent?: number;
  shippingFullName?: string | null;
  shippingPhone?: string | null;
  shippingProvince?: string | null;
  shippingProvinceCode?: number | null;
  shippingDistrict?: string | null;
  shippingDistrictCode?: number | null;
  shippingWard?: string | null;
  shippingWardCode?: number | null;
  shippingStreetAddress?: string | null;
  shippingDeliveryNote?: string | null;
  createdAt: string;
}


export interface AuthResponse {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  user: User;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  details?: { field: string; message: string }[];
  timestamp: string;
  path: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyPhonePayload {
  phoneNumber: string;
  verificationId: string;
  code: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface BookVariant {
  id: string;
  bookId: string;
  sku?: string;
  name: string;               // e.g. "Bản Đặc Biệt (Tặng kèm Bookmark)"
  price: number;              // e.g. 145000
  originalPrice?: number;     // e.g. 180000
  stockQuantity: number;      // e.g. 15
  imageUrl?: string;          // Variant specific image
  attributes?: Record<string, string>; // e.g. { "Loại bìa": "Bìa Cứng" }
  isStandaloneDisplay?: boolean; // Display variant as individual product card in showcase
}

export interface Book {
  id: string;
  sellerId: string;
  sellerName: string;
  categoryId: number | null;
  title: string;
  slug?: string;
  author: string;
  isbn: string | null;
  publicationDetails?: Record<string, string>;
  publisher?: string | null;
  supplier?: string | null;
  publicationYear?: number | null;
  language?: string | null;
  format?: string | null;
  numberOfPages?: number | null;
  weightGrams?: number | null;
  dimensions?: string | null;
  translator?: string | null;
  description: string | null;
  price: number;
  originalPrice?: number;
  currency: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  status: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'ARCHIVED';
  stockQuantity: number;
  isPreOrder?: boolean;
  preOrderDays?: number | null;
  viewsCount?: number;
  rating?: number;
  reviewsCount?: number;
  imageUrls: string[];
  variants?: BookVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  isbn?: string;
  publicationDetails?: Record<string, string>;
  publisher?: string;
  supplier?: string;
  publicationYear?: number;
  language?: string;
  format?: string;
  numberOfPages?: number;
  weightGrams?: number;
  dimensions?: string;
  translator?: string;
  description?: string;
  price: number;
  condition: string;
  stockQuantity: number;
  isPreOrder?: boolean;
  preOrderDays?: number | null;
  categoryId?: number;
  imageUrls?: string[];
}

export interface UpdateBookPayload {
  title?: string;
  author?: string;
  isbn?: string;
  publicationDetails?: Record<string, string>;
  publisher?: string;
  supplier?: string;
  publicationYear?: number;
  language?: string;
  format?: string;
  numberOfPages?: number;
  weightGrams?: number;
  dimensions?: string;
  translator?: string;
  description?: string;
  price?: number;
  condition?: string;
  stockQuantity?: number;
  isPreOrder?: boolean;
  preOrderDays?: number | null;
  categoryId?: number;
  imageUrls?: string[];
}

export interface OrderItem {
  bookId: string;
  bookTitle: string;
  bookCover: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type ShippingCarrierCode = 'SPX' | 'JT_EXPRESS' | 'GHN' | 'GHTK' | 'VIETTEL_POST' | 'VNPOST' | 'OTHER';

export interface CarrierConfig {
  code: ShippingCarrierCode;
  name: string;
  logo: string;
  isActive: boolean;
  baseFee: number;
  weightStepFee: number;
  deliveryDays: string;
  apiToken?: string;
  shopId?: string;
  isSandbox: boolean;
  sandboxEndpoint?: string;
  productionEndpoint?: string;
  notes?: string;
}

export interface StoreGeneralConfig {
  storeName: string;
  hotline: string;
  email: string;
  senderAddress: string;
  senderPhone: string;
  defaultShippingNote: string;
}

export interface OrderTimeline {
  id: string;
  status: string;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
  shippingAddress: string;
  carrierName?: string;
  trackingNumber?: string;
  shippingFee?: number;
  estimatedDelivery?: string;
  weightGrams?: number;
  cancelReason?: string;
  cancelledBy?: string;
  carrierStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentCode?: string;
  paidAt?: string;
  items: OrderItem[];
  subtotalAmount?: number;
  memberTier?: string;
  memberDiscountAmount?: number;
  voucherCode?: string;
  voucherDiscountAmount?: number;
  timelines?: OrderTimeline[];
  riskScore?: number;
  riskLevel?: 'SAFE' | 'WARNING' | 'SUSPICIOUS';
  riskReasons?: string[];
  isFlagged?: boolean;
  isGuest?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FraudAlertEvent {
  orderId: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  isGuest: boolean;
  totalAmount: number;
  riskScore: number;
  riskLevel: 'SAFE' | 'WARNING' | 'SUSPICIOUS';
  riskReasons: string[];
  timestamp: string;
  voiceMessage: string;
}

export interface AutopilotConfig {
  autopilotEnabled: boolean;
  fraudGuestMaxAmount: number;
  fraudCodMaxAmount: number;
  fraudRiskThreshold: number;
  fraudVoiceAlertEnabled: boolean;
}

export interface PushShippingPayload {
  carrier: ShippingCarrierCode;
  trackingNumber?: string;
  weightGrams?: number;
  shippingFee?: number;
  notes?: string;
  estimatedDelivery?: string;
}

export interface CreateOrderItemPayload {
  bookId: string;
  variantId?: string;
  quantity: number;
}

export interface PrintWaybillResponse {
  orderCode: string;
  carrierName: string;
  printUrl?: string | null;
  paperSize: string;
  token?: string | null;
}

export interface CarrierFeeEstimate {
  carrierName: string;
  fee: number;
  estimatedDelivery: string;
  deliveryDays: string;
  note: string;
}

export interface UpdateShippingInfoPayload {
  toName?: string;
  toPhone?: string;
  toAddress?: string;
  toWardName?: string;
  toDistrictName?: string;
  toProvinceName?: string;
  notes?: string;
  weightGrams?: number;
}

export interface CreateOrderPayload {
  shippingAddress: string;
  items: CreateOrderItemPayload[];
  paymentMethod?: string;
  isGuest?: boolean;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  voucherCode?: string;
}

export interface CalculatePricingPayload {
  items: CreateOrderItemPayload[];
  voucherCode?: string;
  shippingFee?: number;
}

export interface PricingResponse {
  subtotal: number;
  memberTier: string;
  memberDiscountPercent: number;
  memberDiscountAmount: number;
  voucherCode?: string | null;
  voucherDiscountAmount: number;
  shippingFee: number;
  finalTotal: number;
  pricingMessage?: string | null;
}

export interface PaymentInitResponse {
  orderId: string;
  paymentMethod: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  paymentCode: string;
  qrUrl?: string | null;
  payUrl?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  message?: string | null;
}

export interface PaymentStatusResponse {
  orderId: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentCode: string;
  amount: number;
  paidAt?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parentId?: number;
}

export interface CategoryCheckResult {
  isValid: boolean;
  suitabilityMessage: string;
  isExactDuplicate: boolean;
  similarCategories: Category[];
}

export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  newPassword: string;
}

export interface CartItem {
  book: Book;
  selectedVariant?: BookVariant;
  quantity: number;
}
