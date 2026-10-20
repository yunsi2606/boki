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
import type { ApiError, AuthResponse } from '@/types';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [returnUrlState, setReturnUrlState] = useState<string | null>(null);

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

  const handleRedirectAfterAuth = (response: AuthResponse, returnUrlOverride?: string | null) => {
    login(response);
    const token = response.token || response.accessToken;

    let returnUrl = returnUrlOverride || null;
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
          if (response.refreshToken) {
            targetUrl.searchParams.set('sso_refresh_token', response.refreshToken);
          }
          if (response.user) {
            targetUrl.searchParams.set('sso_user', encodeURIComponent(JSON.stringify(response.user)));
          }
          window.location.replace(targetUrl.toString());
          return;
        } catch {
          window.location.replace(returnUrl);
          return;
        }
      }
      router.push(returnUrl);
      return;
    }
    router.push('/');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: 'Mật khẩu phải có ít nhất 8 ký tự' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        displayName,
        email,
        password,
      });
      handleRedirectAfterAuth(response);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.details && Array.isArray(apiError.details)) {
        const errors: Record<string, string> = {};
        apiError.details.forEach((d) => {
          if (d.field) errors[d.field] = d.message;
        });
        setFieldErrors(errors);
      } else {
        setError(apiError.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginHref = returnUrlState
    ? `/login?returnUrl=${encodeURIComponent(returnUrlState)}`
    : '/login';

  return (
    <div className={styles.page}>
      <Card className={styles.card} glass>
        <div className={styles.header}>
          <Link href="/" className={styles.brandLogoLink}>
            <img src="/brand/logo.png" alt="Boki Logo" className={styles.brandLogo} />
          </Link>
          <h1>Tạo tài khoản</h1>
          <p>Tham gia Boki để khám phá kho sách bản quyền</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Họ và tên"
            type="text"
            placeholder="Nguyễn Văn A"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors.name}
            required
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Xác nhận lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Tạo tài khoản
          </Button>
        </form>

        <div className={styles.divider}>
          <span>hoặc</span>
        </div>

        <SocialAuthButtons
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onSuccess={handleRedirectAfterAuth}
          onError={setError}
        />

        <div className={styles.footer}>
          Đã có tài khoản?{' '}
          <Link href={loginHref}>Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
}
