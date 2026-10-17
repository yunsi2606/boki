export interface ScheduleUser {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string | null;
  phoneVerified?: boolean;
  avatarUrl?: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | string;
  memberTier?: string;
}

export interface AuthState {
  user: ScheduleUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
