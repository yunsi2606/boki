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
  const [loginUrl, setLoginUrl] = useState<string>('');
  const [registerUrl, setRegisterUrl] = useState<string>('');

  const syncAuth = useCallback(() => {
    // Process SSO callback if redirected from main store with token
    authService.handleSsoCallback();
    const t = authService.getStoredToken();
    const u = authService.getStoredUser();
    setToken(t);
    setUser(u);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    syncAuth();
    if (typeof window !== 'undefined') {
      setLoginUrl(authService.getLoginUrl(window.location.href));
      setRegisterUrl(authService.getRegisterUrl(window.location.href));
    }

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
    loginUrl: loginUrl || authService.getLoginUrl(),
    registerUrl: registerUrl || authService.getRegisterUrl(),
    redirectToLogin: (returnUrl?: string) =>
      authService.redirectToLogin(
        returnUrl || (typeof window !== 'undefined' ? window.location.href : undefined)
      ),
    hasPurchased,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    const u = authService.getStoredUser();
    const t = authService.getStoredToken();
    return {
      user: u,
      token: t,
      isAuthenticated: !!t && !!u,
      isLoading: false,
      logout: () => authService.logout(),
      loginUrl: authService.getLoginUrl(),
      registerUrl: authService.getRegisterUrl(),
      redirectToLogin: (returnUrl?: string) => authService.redirectToLogin(returnUrl),
      hasPurchased: () => false,
    };
  }
  return ctx;
}
