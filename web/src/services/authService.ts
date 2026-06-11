import { api } from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types';

export const authService = {
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (payload: LoginPayload): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/login', payload),

  getCurrentUser: (): Promise<User> =>
    api.get<User>('/auth/me'),

  loginOAuth: (provider: string, token: string, redirectUri?: string): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/oauth', { provider, token, redirectUri }),

  verifyPhone: (payload: { phoneNumber: string; verificationId: string; code: string }): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/verify-phone', payload),

  verifyEmail: (email: string, token: string): Promise<void> =>
    api.post<void>('/auth/verify-email', { email, token }),
};
