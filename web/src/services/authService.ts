import { api } from './api';
import type { AuthResponse, ForgotPasswordPayload, LoginPayload, RefreshTokenPayload, RegisterPayload, ResetPasswordPayload, UpdateProfilePayload, User } from '@/types';

export const authService = {
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (payload: LoginPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/login', payload),

  refreshToken: (payload: RefreshTokenPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/refresh', payload),

  getCurrentUser: (): Promise<User> =>
    api.get<User>('/auth/me'),

  updateProfile: (payload: UpdateProfilePayload): Promise<User> =>
    api.patch<User>('/auth/me', payload),

  loginOAuth: (provider: string, token: string, redirectUri?: string): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/oauth', { provider, token, redirectUri }),

  verifyPhone: (payload: { phoneNumber: string; verificationId: string; code: string }): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/verify-phone', payload),

  verifyEmail: (email: string, token: string): Promise<void> =>
    api.post<void>('/auth/verify-email', { email, token }),

  forgotPassword: (payload: ForgotPasswordPayload): Promise<void> =>
    api.post<void>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload): Promise<void> =>
    api.post<void>('/auth/reset-password', payload),
};
