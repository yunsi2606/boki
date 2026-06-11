'use client';

import { useState, type FormEvent } from 'react';
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

  const handleOAuthRegister = async (provider: 'google' | 'facebook') => {
    setError('');
    setIsLoading(true);

    try {
      let token = '';

      if (!isFirebaseConfigured) {
        // Mock token for local developer bypass
        token = provider === 'google' ? 'mock-google-token' : 'mock-facebook-token';
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulating latency
      } else {
        if (!firebaseAuth) throw new Error('Firebase Auth is not initialized');
        const providerObj = provider === 'google' 
          ? new GoogleAuthProvider() 
          : new FacebookAuthProvider();
        const result = await signInWithPopup(firebaseAuth, providerObj);
        token = await result.user.getIdToken();
      }

      const response = await authService.loginOAuth(provider, token);
      login(response);
      router.push('/');
    } catch (err: any) {
      console.error(`${provider} registration failed:`, err);
      setError(err.message || `${provider} registration failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({ email, password, displayName });
      login(response);
      router.push('/');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.details) {
        const errors: Record<string, string> = {};
        apiError.details.forEach((d) => {
          errors[d.field] = d.message;
        });
        setFieldErrors(errors);
      }
      setError(apiError.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card} glass>
        <div className={styles.header}>
          <h1>Create your account</h1>
          <p>Join Boki and start buying &amp; selling books</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Display Name"
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors.displayName}
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
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.oauthButtons}>
          <Button
            variant="secondary"
            onClick={() => handleOAuthRegister('google')}
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
            onClick={() => handleOAuthRegister('facebook')}
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
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </div>
      </Card>
    </div>
  );
}
