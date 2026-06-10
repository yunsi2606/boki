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
