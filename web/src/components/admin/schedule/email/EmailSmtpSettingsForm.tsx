'use client';

import React, { useState } from 'react';
import type { SmtpConfig } from '@/services/adminScheduleEmailService';
import { adminScheduleEmailService } from '@/services/adminScheduleEmailService';
import styles from './emailSmtpSettingsForm.module.css';

interface Props {
  initialConfig: SmtpConfig;
  onSaved: () => void;
}

export function EmailSmtpSettingsForm({ initialConfig, onSaved }: Props) {
  const [config, setConfig] = useState<SmtpConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (field: keyof SmtpConfig, val: any) => {
    setConfig((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await adminScheduleEmailService.updateSmtpConfig(config);
      setTestResult({ success: true, message: 'Đã lưu cấu hình máy chủ SMTP thành công.' });
      onSaved();
    } catch (err: any) {
      setTestResult({ success: false, message: 'Lỗi lưu cấu hình: ' + (err.message || 'Lỗi server') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const res = await adminScheduleEmailService.testSmtpConnection(config);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: 'Lỗi kiểm tra kết nối: ' + (err.message || 'Lỗi kết nối') });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Thông số Máy chủ SMTP</h3>
          <form onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>SMTP Host</label>
                <input
                  type="text"
                  required
                  value={config.host}
                  onChange={(e) => handleChange('host', e.target.value)}
                  className={styles.input}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Port</label>
                <input
                  type="number"
                  required
                  value={config.port}
                  onChange={(e) => handleChange('port', Number(e.target.value))}
                  className={styles.input}
                  placeholder="587"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Username / Tài khoản</label>
                <input
                  type="text"
                  value={config.username || ''}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mật khẩu / App Password</label>
                <input
                  type="password"
                  value={config.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={styles.input}
                  placeholder="Để trống nếu không đổi"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tên người gửi (From Name)</label>
                <input
                  type="text"
                  required
                  value={config.fromName}
                  onChange={(e) => handleChange('fromName', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Địa chỉ gửi (From Email)</label>
                <input
                  type="email"
                  required
                  value={config.fromEmail}
                  onChange={(e) => handleChange('fromEmail', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Reply-To Email</label>
                <input
                  type="email"
                  value={config.replyTo || ''}
                  onChange={(e) => handleChange('replyTo', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tốc độ tối đa (email/phút)</label>
                <input
                  type="number"
                  value={config.maxRatePerMinute || 30}
                  onChange={(e) => handleChange('maxRatePerMinute', Number(e.target.value))}
                  className={styles.input}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={Boolean(config.isEnabled)}
                    onChange={(e) => handleChange('isEnabled', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.label}>Kích hoạt dịch vụ gửi email Outbox Worker</span>
                </label>
              </div>
            </div>

            {testResult && (
              <div className={`${styles.alertBox} ${testResult.success ? styles.alertSuccess : styles.alertError}`}>
                {testResult.message}
              </div>
            )}

            <div className={styles.actionsRow}>
              <button type="submit" disabled={isSaving} className={styles.saveBtn}>
                {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
              <button type="button" onClick={handleTest} disabled={isTesting} className={styles.testBtn}>
                {isTesting ? 'Đang test...' : 'Kiểm tra kết nối SMTP'}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Chuẩn Uy Tín Tên Miền (Anti-Spam & Deliverability)</h3>
          <p style={{ fontSize: 13, color: '#6c757d', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Để tránh bị Google / Yahoo đưa vào thư mục Spam hoặc Blacklist, tên miền gửi email cần cấu hình đầy đủ các bản ghi DNS sau:
          </p>

          <div className={styles.dnsList}>
            <div className={styles.dnsItem}>
              <div className={styles.dnsHeader}>
                <span className={styles.dnsTitle}>1. SPF (Sender Policy Framework)</span>
                <span className={styles.dnsTag}>TXT</span>
              </div>
              <p className={styles.dnsDesc}>Ủy quyền cho IP/máy chủ SMTP gửi email đại diện tên miền:</p>
              <code className={styles.dnsCode}>v=spf1 include:_spf.google.com ~all</code>
            </div>

            <div className={styles.dnsItem}>
              <div className={styles.dnsHeader}>
                <span className={styles.dnsTitle}>2. DKIM (Ký số điện tử)</span>
                <span className={styles.dnsTag}>CNAME / TXT</span>
              </div>
              <p className={styles.dnsDesc}>Chống giả mạo tiêu đề thư. Tạo selector trong cài đặt nhà cung cấp email.</p>
              <code className={styles.dnsCode}>boki._domainkey.bokistore.vn</code>
            </div>

            <div className={styles.dnsItem}>
              <div className={styles.dnsHeader}>
                <span className={styles.dnsTitle}>3. DMARC (Chính sách xử lý thư giả mạo)</span>
                <span className={styles.dnsTag}>TXT</span>
              </div>
              <p className={styles.dnsDesc}>Bắt buộc từ năm 2024 để thư vào hộp thư đến (Inbox) Gmail / Yahoo:</p>
              <code className={styles.dnsCode}>v=DMARC1; p=quarantine; rua=mailto:dmarc@bokistore.vn</code>
            </div>

            <div className={styles.dnsItem}>
              <div className={styles.dnsHeader}>
                <span className={styles.dnsTitle}>4. RFC 8058 One-Click Unsubscribe</span>
                <span className={styles.dnsTag}>Hệ thống Boki tự động</span>
              </div>
              <p className={styles.dnsDesc}>
                Header <code>List-Unsubscribe</code> và <code>List-Unsubscribe-Post</code> đã được tự động tiêm vào mọi email gửi đi, giúp tỷ lệ khiếu nại spam luôn dưới 0.1%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
