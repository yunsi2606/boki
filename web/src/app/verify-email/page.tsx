'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from '../(auth)/auth.module.css';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setErrorMessage('Missing email or verification token in link.');
      return;
    }

    authService
      .verifyEmail(email, token)
      .then(() => {
        setStatus('success');
      })
      .catch((err: any) => {
        console.error('Email verification error:', err);
        setStatus('error');
        setErrorMessage(
          err.message || 'The verification link is invalid, expired, or has already been used.'
        );
      });
  }, [email, token]);

  return (
    <Card className={styles.card} glass>
      <div className={styles.header}>
        {status === 'loading' && (
          <>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', marginBottom: '20px' }}>
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" stroke="rgba(168, 85, 247, 0.2)" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeDasharray="30 30" />
              </svg>
            </div>
            <h1>Verifying Email</h1>
            <p>Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '20px', color: '#10b981' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1>Email Verified!</h1>
            <p style={{ color: '#9ca3af' }}>Your email address <strong>{email}</strong> has been successfully verified.</p>
            <div style={{ marginTop: '24px' }}>
              <Button onClick={() => router.push('/login')} fullWidth>
                Go to Sign In
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', marginBottom: '20px', color: '#ef4444' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1>Verification Failed</h1>
            <p style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '14px', margin: '16px 0' }}>
              {errorMessage}
            </p>
            <div style={{ marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => router.push('/')} fullWidth>
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={
        <Card className={styles.card} glass>
          <div className={styles.header}>
            <h1>Loading...</h1>
          </div>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
