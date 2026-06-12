'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { auth as firebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import type { ApiError } from '@/types';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check query parameters for OAuth redirect callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state'); // 'google' or 'facebook'

      if (code && state && (state === 'google' || state === 'facebook')) {
        setIsLoading(true);
        const redirectUri = window.location.origin + '/login';

        authService.loginOAuth(state, code, redirectUri)
          .then((response) => {
            login(response);
            router.push('/');
          })
          .catch((err: any) => {
            console.error('OAuth exchange failed:', err);
            setError(err.message || 'Xác thực tài khoản liên kết thất bại. Vui lòng thử lại.');
            setIsLoading(false);
          });
      }
    }
  }, [login, router]);

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setError('');

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const facebookClientId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID; // Or fallback to client app id

    // Determine if we should run in mock bypass mode
    const isMock = !googleClientId || googleClientId === 'your-google-client-id';

    if (isMock) {
      setIsLoading(true);
      // Mock login token for local development bypass
      const mockToken = provider === 'google' ? 'mock-google-token' : 'mock-facebook-token';
      try {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulating latency
        const response = await authService.loginOAuth(provider, mockToken);
        login(response);
        router.push('/');
      } catch (err: any) {
        console.error(`${provider} mock login failed:`, err);
        setError(err.message || `${provider} mock login failed. Please try again.`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Redirect to provider consent page to request authorization code
    const redirectUri = window.location.origin + '/login';
    let authUrl = '';

    if (provider === 'google') {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=google`;
    } else {
      const fbAppId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''; // using project id or app id
      authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email,public_profile&state=facebook`;
    }

    window.location.href = authUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      login(response);
      router.push('/');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card} glass>
        <div className={styles.header}>
          <h1>Welcome back</h1>
          <p>Sign in to your Boki account</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.oauthButtons}>
          <Button
            variant="secondary"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            fullWidth
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleOAuthLogin('facebook')}
            disabled={isLoading}
            fullWidth
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </Button>
        </div>

        <div className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/register">Sign up</Link>
        </div>
      </Card>
    </div>
  );
}
