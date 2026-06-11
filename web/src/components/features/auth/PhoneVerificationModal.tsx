'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { auth as firebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './PhoneVerificationModal.module.css';

export default function PhoneVerificationModal() {
  const { user, login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+84');
  const [step, setStep] = useState<1 | 2>(1); // 1: Phone input, 2: OTP input
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Resend SMS cooldown timer
  const [cooldown, setCooldown] = useState(0);

  // Refs for tracking Firebase state
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Local Dev Bypass states
  const [mockVerificationId, setMockVerificationId] = useState<string | null>(null);

  // Auto-decrement cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Clean up recaptcha widget on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Ensure modal only displays for authenticated, unverified users
  if (!user || user.phoneVerified) {
    return null;
  }

  // Setup recaptcha verifier
  const initRecaptcha = () => {
    if (recaptchaVerifierRef.current) return;
    if (!firebaseAuth) return;

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        firebaseAuth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            // Recaptcha resolved
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        }
      );
    } catch (err: any) {
      console.error('Recaptcha init failed:', err);
      setError('Failed to initialize recaptcha: ' + err.message);
    }
  };

  // Submit phone number to request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\s+/g, '')}`;

    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid phone number');
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      // DEV BYPASS MODE
      setTimeout(() => {
        setIsLoading(false);
        setStep(2);
        setCooldown(60);
        setMockVerificationId('mock-verification-session-id');
        console.log(`[DEV MODE] OTP requested for ${fullPhoneNumber}. Use OTP code: 123456`);
      }, 1200);
      return;
    }

    try {
      initRecaptcha();
      
      if (!recaptchaVerifierRef.current || !firebaseAuth) {
        throw new Error('Firebase Auth is not initialized');
      }

      const confirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        fullPhoneNumber,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = confirmationResult;
      setStep(2);
      setCooldown(60);
      setSuccess('Verification code sent successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error sending SMS:', err);
      setError(err.message || 'Failed to send SMS code. Please verify the number format.');
      // Reset recaptcha
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (e) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP inputs key navigation and focus
  const handleOtpChange = (index: number, val: string) => {
    // Only accept numeric inputs
    if (val && !/^\d+$/.test(val)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = val.slice(-1); // Keep last char
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        otpInputsRef.current[index - 1]?.focus();
      } else {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      }
    }
  };

  // Submit OTP to backend for server-side verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const code = otpValues.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      setIsLoading(false);
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\s+/g, '')}`;
    const verificationId = isFirebaseConfigured
      ? confirmationResultRef.current?.verificationId
      : mockVerificationId;

    if (!verificationId) {
      setError('Verification session expired. Please go back and request a new code.');
      setIsLoading(false);
      return;
    }

    try {
      // Call backend REST endpoint
      const response = await authService.verifyPhone({
        phoneNumber: fullPhoneNumber,
        verificationId,
        code
      });

      // Update auth context with the new token & verified user
      login(response);
      setSuccess('Phone number verified successfully!');
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.content}>
          <div className={styles.logoIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>

          <h2 className={styles.title}>
            {step === 1 ? 'Verify Phone Number' : 'Enter Security Code'}
          </h2>
          
          <p className={styles.subtitle}>
            {step === 1
              ? 'To protect your account and start using Boki book marketplace, please verify your phone number.'
              : `We have sent a 6-digit security code to ${countryCode} ${phoneNumber}. Please input the code below.`}
          </p>

          {!isFirebaseConfigured && (
            <div className={styles.devAlert}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <strong>Developer Bypass Mode Active</strong>
                <br />
                {step === 1
                  ? 'Input any phone number to proceed.'
                  : 'Use verification code: 123456'}
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.phoneInputWrapper}>
                  <select
                    className={styles.countryCode}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="+84">VN (+84)</option>
                    <option value="+1">US (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+81">JP (+81)</option>
                  </select>
                  <Input
                    type="tel"
                    className={styles.phoneInput}
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div id="recaptcha-container" />

              <div className={styles.actions}>
                <Button type="submit" isLoading={isLoading} fullWidth>
                  Send OTP Code
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className={styles.formGroup}>
                <label className={styles.label}>6-Digit OTP Code</label>
                <div className={styles.otpInputsWrapper}>
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputsRef.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className={styles.otpInput}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <Button type="submit" isLoading={isLoading} fullWidth>
                  Verify Code
                </Button>
                
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => {
                    setStep(1);
                    setOtpValues(Array(6).fill(''));
                    setError(null);
                  }}
                  disabled={isLoading}
                >
                  Change phone number
                </button>
              </div>

              <div className={styles.resendText}>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  className={styles.resendBtn}
                  disabled={cooldown > 0 || isLoading}
                  onClick={handleRequestOtp}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend SMS'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
