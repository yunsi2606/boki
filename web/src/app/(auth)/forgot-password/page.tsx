'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import type { ApiError } from '@/types';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card} glass>
        <div className={styles.header}>
          <h1>Forgot password?</h1>
          <p>Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {submitted ? (
          <div className={styles.success}>
            ✉️ <strong>Check your inbox!</strong>
            <br />
            If an account exists for <strong>{email}</strong>, a password reset
            link has been sent. It may take a minute to arrive.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Button type="submit" fullWidth isLoading={isLoading}>
              Send reset link
            </Button>
          </form>
        )}

        <div className={styles.footer}>
          Remember your password?{' '}
          <Link href="/login">Back to sign in</Link>
        </div>
      </Card>
    </div>
  );
}
