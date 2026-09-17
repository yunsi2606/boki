'use client';

import { useState, useEffect, Suspense, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import type { ApiError } from '@/types';
import styles from '../auth.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token') ?? '';
    const e = searchParams.get('email') ?? '';
    setToken(t);
    setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({ token, email, newPassword });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const isInvalidLink = !token || !email;

  return (
    <Card className={styles.card} glass>
      <div className={styles.header}>
        <Link href="/" className={styles.brandLogoLink}>
          <img src="/brand/logo.png" alt="Boki Logo" className={styles.brandLogo} />
        </Link>
        <h1>Set new password</h1>
        <p>Choose a strong password for your account.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {success ? (
        <div className={styles.success}>
          ✅ <strong>Password updated!</strong>
          <br />
          Redirecting you to sign in…
        </div>
      ) : isInvalidLink ? (
        <div className={styles.error}>
          This reset link is invalid or has expired.{' '}
          <Link href="/forgot-password">Request a new one</Link>.
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={() => {}}
              readOnly
              autoComplete="email"
            />
            <p className={styles.inputHint}>Confirmed from your reset link</p>
          </div>
          <Input
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            placeholder="Repeat your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Reset password
          </Button>
        </form>
      )}

      <div className={styles.footer}>
        <Link href="/login">Back to sign in</Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<div style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

