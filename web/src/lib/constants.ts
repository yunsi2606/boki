/** Application-wide constants */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
export const TOKEN_STORAGE_KEY = 'boki_auth_token';
export const USER_STORAGE_KEY = 'boki_user';

/** Spacing values (matching CSS tokens) */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;
