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
          <Link href="/" className={styles.brandLogoLink}>
            <img src="/brand/logo.png" alt="Boki Logo" className={styles.brandLogo} />
          </Link>
          <h1>Quên mật khẩu?</h1>
          <p>Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết đặt lại mật khẩu.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {submitted ? (
          <div className={styles.success}>
            ✉️ <strong>Đã gửi thư !</strong>
            <br />
            Nếu có tài khoản với <strong>{email}</strong>, một liên kết đặt lại mật khẩu đã được gửi.
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
              Đặt lại mật khẩu
            </Button>
          </form>
        )}

        <div className={styles.footer}>
          Đã có tài khoản?{' '}
          <Link href="/login">Quay lại đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
}
