'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import styles from './PhoneVerificationModal.module.css';

export default function PhoneVerificationModal() {
  const {
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
  } = usePhoneVerification();

  if (!user || user.phoneVerified) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.badgeWrapper}>
          <div className={styles.iconCircle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
        </div>

        <h2 className={styles.title}>
          {step === 1 ? 'Xác minh số điện thoại' : 'Nhập mã xác thực OTP'}
        </h2>

        <p className={styles.subtitle}>
          {step === 1
            ? 'Để bảo mật tài khoản và cập nhật trạng thái đơn sách, vui lòng xác thực số điện thoại của bạn.'
            : `Mã xác thực gồm 6 chữ số đã được gửi tới số ${countryCode} ${phoneNumber}.`}
        </p>

        {!isFirebaseConfigured && (
          <div className={styles.devAlert}>
            <span className={styles.devTag}>Thử nghiệm</span>
            <span>Nhập số điện thoại bất kỳ và điền mã OTP: <strong>123456</strong></span>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className={styles.form}>
            <label className={styles.fieldLabel}>Số điện thoại của bạn</label>
            <div className={styles.phoneInputRow}>
              <select
                className={styles.countrySelect}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+84">VN (+84)</option>
                <option value="+1">US (+1)</option>
                <option value="+81">JP (+81)</option>
              </select>
              <input
                type="tel"
                className={styles.phoneInput}
                placeholder="0912 345 678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div id="recaptcha-container" />

            <div className={styles.actionGroup}>
              <Button type="submit" isLoading={isLoading} fullWidth size="lg">
                Gửi mã xác thực
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <label className={styles.fieldLabel}>Mã xác thực 6 chữ số</label>
            <div className={styles.otpGrid}>
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpInputsRef.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className={styles.otpBox}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handlePasteOtp}
                  autoFocus={idx === 0}
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className={styles.actionGroup}>
              <Button type="submit" isLoading={isLoading} fullWidth size="lg">
                Xác nhận
              </Button>
              <button
                type="button"
                className={styles.linkButton}
                onClick={resetToPhoneStep}
                disabled={isLoading}
              >
                Đổi số điện thoại khác
              </button>
            </div>

            <div className={styles.resendSection}>
              Chưa nhận được mã?{' '}
              <button
                type="button"
                className={styles.resendLink}
                disabled={cooldown > 0 || isLoading}
                onClick={() => handleRequestOtp()}
              >
                {cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại mã'}
              </button>
            </div>
          </form>
        )}

        <div className={styles.footerRow}>
          <button type="button" className={styles.logoutLink} onClick={logout}>
            Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
