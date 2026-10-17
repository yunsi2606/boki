'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { ScheduleUser, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthContextValue extends AuthState {
  logout: () => void;
  loginUrl: string;
  registerUrl: string;
  redirectToLogin: (returnUrl?: string) => void;
  hasPurchased: (bookIdOrSlug: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ScheduleUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncAuth = useCallback(() => {
    const t = authService.getStoredToken();
    const u = authService.getStoredUser();
    setToken(t);
    setUser(u);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    syncAuth();

    const handleAuthChange = () => syncAuth();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('boki_auth_change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('boki_auth_change', handleAuthChange);
    };
  }, [syncAuth]);

  const handleLogout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const hasPurchased = useCallback(
    (bookIdOrSlug: string) => {
      return authService.hasPurchasedBook(bookIdOrSlug, user);
    },
    [user]
  );

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    logout: handleLogout,
    loginUrl: authService.getLoginUrl(),
    registerUrl: authService.getRegisterUrl(),
    redirectToLogin: (returnUrl?: string) => authService.redirectToLogin(returnUrl),
    hasPurchased,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Graceful fallback for components outside provider
    const u = authService.getStoredUser();
    const t = authService.getStoredToken();
    return {
      user: u,
      token: t,
      isAuthenticated: !!u && !!t,
      isLoading: false,
      logout: () => authService.logout(),
      loginUrl: authService.getLoginUrl(),
      registerUrl: authService.getRegisterUrl(),
      redirectToLogin: (returnUrl?: string) => authService.redirectToLogin(returnUrl),
      hasPurchased: (id: string) => authService.hasPurchasedBook(id, u),
    };
  }
  return ctx;
}
