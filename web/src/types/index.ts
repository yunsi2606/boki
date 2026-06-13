export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string | null;
  phoneVerified: boolean;
  avatarUrl: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
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

export interface Book {
  id: string;
  sellerId: string;
  sellerName: string;
  categoryId: number | null;
  title: string;
  author: string;
  isbn: string | null;
  description: string | null;
  price: number;
  currency: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  status: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'ARCHIVED';
  stockQuantity: number;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  price: number;
  condition: string;
  stockQuantity: number;
  categoryId?: number;
  imageUrls?: string[];
}

export interface UpdateBookPayload {
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  price?: number;
  condition?: string;
  stockQuantity?: number;
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

export interface Order {
  id: string;
  buyerId: string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemPayload {
  bookId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  shippingAddress: string;
  items: CreateOrderItemPayload[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
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
  quantity: number;
}

