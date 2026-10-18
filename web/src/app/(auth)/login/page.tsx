'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SocialAuthButtons from '@/components/features/auth/SocialAuthButtons';
import type { ApiError } from '@/types';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [returnUrlState, setReturnUrlState] = useState<string | null>(null);

  // Preserve returnUrl in sessionStorage immediately upon page mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const ret = searchParams.get('returnUrl') || sessionStorage.getItem('boki_login_return_url');
      if (ret) {
        sessionStorage.setItem('boki_login_return_url', ret);
        setReturnUrlState(ret);
      }
    }
  }, []);

  const handleRedirectAfterLogin = (authData: any, returnUrlOverride?: string | null) => {
    login(authData);

    const token = authData.token || authData.accessToken;
    let returnUrl: string | null = returnUrlOverride || null;
    if (!returnUrl && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      returnUrl = searchParams.get('returnUrl') || sessionStorage.getItem('boki_login_return_url');
      sessionStorage.removeItem('boki_login_return_url');
    }

    if (returnUrl) {
      if (returnUrl.startsWith('http://') || returnUrl.startsWith('https://')) {
        try {
          const targetUrl = new URL(returnUrl);
          if (token) targetUrl.searchParams.set('sso_token', token);
          if (authData.user) {
            targetUrl.searchParams.set('sso_user', encodeURIComponent(JSON.stringify(authData.user)));
          }
          window.location.replace(targetUrl.toString());
          return;
        } catch (e) {
          console.error('Invalid returnUrl:', e);
        }
      } else {
        router.push(returnUrl);
        return;
      }
    }

    if (authData.user?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  // Check query parameters for OAuth redirect callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const stateRaw = searchParams.get('state');

      let provider: 'google' | 'facebook' | null = null;
      let returnUrlFromState: string | null = null;

      if (stateRaw) {
        if (stateRaw === 'google' || stateRaw.startsWith('google___')) {
          provider = 'google';
          if (stateRaw.startsWith('google___')) {
            try {
              returnUrlFromState = decodeURIComponent(stateRaw.slice(9));
            } catch {}
          }
        } else if (stateRaw === 'facebook' || stateRaw.startsWith('facebook___')) {
          provider = 'facebook';
          if (stateRaw.startsWith('facebook___')) {
            try {
              returnUrlFromState = decodeURIComponent(stateRaw.slice(11));
            } catch {}
          }
        }
      }

      if (code && provider) {
        setIsLoading(true);
        const redirectUri = window.location.origin + '/login';

        authService
          .loginOAuth(provider, code, redirectUri)
          .then((response) => {
            handleRedirectAfterLogin(response, returnUrlFromState);
          })
          .catch((err: any) => {
            console.error('OAuth exchange failed:', err);
            setError(err.message || 'Xác thực tài khoản liên kết thất bại. Vui lòng thử lại.');
            setIsLoading(false);
          });
      }
    }
  }, [login, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      handleRedirectAfterLogin(response);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerHref = returnUrlState
    ? `/register?returnUrl=${encodeURIComponent(returnUrlState)}`
    : '/register';

  return (
    <div className={styles.page}>
      <Card className={styles.card} glass>
        <div className={styles.header}>
          <Link href="/" className={styles.brandLogoLink}>
            <img src="/brand/logo.png" alt="Boki Logo" className={styles.brandLogo} />
          </Link>
          <h1>Chào mừng trở lại</h1>
          <p>Đăng nhập tài khoản vào Boki</p>
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
            Đăng nhập
          </Button>
          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">Quên mật khẩu?</Link>
          </div>
        </form>

        <div className={styles.divider}>
          <span>hoặc</span>
        </div>

        <SocialAuthButtons
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onSuccess={handleRedirectAfterLogin}
          onError={setError}
        />

        <div className={styles.footer}>
          Chưa có tài khoản?{' '}
          <Link href={registerHref}>Đăng ký</Link>
        </div>
      </Card>
    </div>
  );
}
