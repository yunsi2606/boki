'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { auth as firebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

export function usePhoneVerification() {
  const { user, login, logout } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+84');
  const [step, setStep] = useState<1 | 2>(1);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [mockVerificationId, setMockVerificationId] = useState<string | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const initRecaptcha = () => {
    if (recaptchaVerifierRef.current || !firebaseAuth) return;
    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        firebaseAuth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            setError('Mã kiểm tra reCAPTCHA đã hết hạn. Vui lòng thử lại.');
          },
        }
      );
    } catch (err: any) {
      console.error('Recaptcha init failed:', err);
      setError('Không thể khởi tạo reCAPTCHA: ' + err.message);
    }
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^0/, '');
    const fullPhoneNumber = `${countryCode}${cleanPhone}`;

    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 số).');
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      setTimeout(() => {
        setIsLoading(false);
        setStep(2);
        setCooldown(60);
        setMockVerificationId('mock-verification-session-id');
      }, 600);
      return;
    }

    try {
      initRecaptcha();
      if (!recaptchaVerifierRef.current || !firebaseAuth) {
        throw new Error('Dịch vụ xác thực SMS chưa sẵn sàng.');
      }

      const confirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        fullPhoneNumber,
        recaptchaVerifierRef.current
      );

      confirmationResultRef.current = confirmationResult;
      setStep(2);
      setCooldown(60);
      setSuccess('Mã xác thực đã được gửi đến số điện thoại của bạn.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error sending SMS:', err);
      setError(err.message || 'Gửi mã xác thực thất bại. Vui lòng kiểm tra lại định dạng số.');
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val && !/^\d+$/.test(val)) return;

    const newOtp = [...otpValues];
    newOtp[index] = val.slice(-1);
    setOtpValues(newOtp);

    if (val && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const newOtp = [...otpValues];
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpValues];
        newOtp[index] = '';
        setOtpValues(newOtp);
      }
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasted)) return;

    const digits = pasted.split('');
    setOtpValues(digits);
    otpInputsRef.current[5]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const code = otpValues.join('');
    if (code.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      setIsLoading(false);
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^0/, '');
    const fullPhoneNumber = `${countryCode}${cleanPhone}`;
    const verificationId = isFirebaseConfigured
      ? confirmationResultRef.current?.verificationId
      : mockVerificationId;

    if (!verificationId) {
      setError('Phiên xác thực đã hết hạn. Vui lòng yêu cầu gửi lại mã.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.verifyPhone({
        phoneNumber: fullPhoneNumber,
        verificationId,
        code,
      });

      login(response);
      setSuccess('Xác minh số điện thoại thành công!');
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToPhoneStep = () => {
    setStep(1);
    setOtpValues(Array(6).fill(''));
    setError(null);
    setSuccess(null);
  };

  return {
    user,
    logout,
    step,
    phoneNumber,
    setPhoneNumber,
    countryCode,
    setCountryCode,
    otpValues,
    isLoading,
    error,
    success,
    cooldown,
    isFirebaseConfigured,
    otpInputsRef,
    handleRequestOtp,
    handleVerifyOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handlePasteOtp,
    resetToPhoneStep,
  };
}
