'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { adminService } from '@/services/adminService';
import { paymentService } from '@/services/paymentService';
import styles from './PaymentConfigTab.module.css';

interface PaymentConfigTabProps {
  onSuccessNotice?: (msg: string) => void;
}

export default function PaymentConfigTab({ onSuccessNotice }: PaymentConfigTabProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form states
  const [sepayBank, setSepayBank] = useState<string>('MBBank');
  const [sepayAccount, setSepayAccount] = useState<string>('0868889999');
  const [sepayName, setSepayName] = useState<string>('CONG TY CO PHAN BOKI STORE');
  const [sepayApiKey, setSepayApiKey] = useState<string>('BOKI_SEPAY_SECURE_TOKEN_2026');

  const [momoPartnerCode, setMomoPartnerCode] = useState<string>('MOMO');
  const [momoAccessKey, setMomoAccessKey] = useState<string>('F8BBA842ECF85');
  const [momoSecretKey, setMomoSecretKey] = useState<string>('K951B6PE1waDMi640xX0huIC1kAEdaBs');
  const [momoSandbox, setMomoSandbox] = useState<boolean>(true);

  const [vnpayTmnCode, setVnpayTmnCode] = useState<string>('BOKIST01');
  const [vnpayHashSecret, setVnpayHashSecret] = useState<string>('BOKIVNPAYSECRETKEYHASH2026XYZABC');
  const [vnpaySandbox, setVnpaySandbox] = useState<boolean>(true);

  // Copy status
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulator states
  const [simCode, setSimCode] = useState<string>('BOKI12345678');
  const [simAmount, setSimAmount] = useState<number>(50000);
  const [simContent, setSimContent] = useState<string>('BOKI12345678 thanh toan sach');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const configs = await adminService.getPaymentConfigs();
        if (configs['sepay_bank_code']) setSepayBank(configs['sepay_bank_code']);
        if (configs['sepay_account_number']) setSepayAccount(configs['sepay_account_number']);
        if (configs['sepay_account_name']) setSepayName(configs['sepay_account_name']);
        if (configs['sepay_api_key']) setSepayApiKey(configs['sepay_api_key']);

        if (configs['momo_partner_code']) setMomoPartnerCode(configs['momo_partner_code']);
        if (configs['momo_access_key']) setMomoAccessKey(configs['momo_access_key']);
        if (configs['momo_secret_key']) setMomoSecretKey(configs['momo_secret_key']);
        if (configs['momo_sandbox_enabled']) setMomoSandbox(configs['momo_sandbox_enabled'] === 'true');

        if (configs['vnpay_tmn_code']) setVnpayTmnCode(configs['vnpay_tmn_code']);
        if (configs['vnpay_hash_secret']) setVnpayHashSecret(configs['vnpay_hash_secret']);
        if (configs['vnpay_sandbox_enabled']) setVnpaySandbox(configs['vnpay_sandbox_enabled'] === 'true');
      } catch (err) {
        console.error('Failed to load payment configs', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: Record<string, string> = {
        sepay_bank_code: sepayBank.trim(),
        sepay_account_number: sepayAccount.trim(),
        sepay_account_name: sepayName.trim(),
        sepay_api_key: sepayApiKey.trim(),
        momo_partner_code: momoPartnerCode.trim(),
        momo_access_key: momoAccessKey.trim(),
        momo_secret_key: momoSecretKey.trim(),
        momo_sandbox_enabled: String(momoSandbox),
        vnpay_tmn_code: vnpayTmnCode.trim(),
        vnpay_hash_secret: vnpayHashSecret.trim(),
        vnpay_sandbox_enabled: String(vnpaySandbox),
      };

      await adminService.updatePaymentConfigs(payload);
      if (onSuccessNotice) {
        onSuccessNotice('Đã lưu thông số các cổng thanh toán (SePay, MoMo, VNPay) thành công!');
      } else {
        alert('Đã lưu cấu hình thanh toán thành công!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const getOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://boki.store';
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateWebhook = async () => {
    if (!simCode.trim()) {
      alert('Vui lòng nhập mã thanh toán!');
      return;
    }
    setSimulating(true);
    setSimResult(null);
    try {
      const code = simCode.trim().toUpperCase();
      const content = simContent.trim() ? simContent.trim() : `${code} chuyen khoan`;
      const res = await paymentService.simulateSePayWebhook({
        id: Math.floor(Math.random() * 1000000),
        gateway: sepayBank,
        transactionDate: new Date().toISOString(),
        accountNumber: sepayAccount,
        code,
        content,
        transferType: 'in',
        transferAmount: simAmount,
        referenceCode: `SIM_${Date.now()}`,
      });

      if (res.success) {
        setSimResult({
          success: true,
          message: `✅ Bắn Webhook thành công! Đơn hàng khớp mã ${code} đã chuyển sang trạng thái: ĐÃ THANH TOÁN (PAID).`,
        });
      } else {
        setSimResult({
          success: false,
          message: `⚠️ Webhook trả về không thành công hoặc không tìm thấy đơn hàng chứa mã "${code}". Vui lòng kiểm tra lại mã thanh toán.`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gửi webhook';
      setSimResult({
        success: false,
        message: `❌ Lỗi gửi Webhook SePay: ${msg}`,
      });
    } finally {
      setSimulating(false);
    }
  };

  const sampleQrUrl = `https://qr.sepay.vn/img?bank=${encodeURIComponent(sepayBank)}&acc=${encodeURIComponent(
    sepayAccount
  )}&template=compact&amount=50000&des=${encodeURIComponent(simCode || 'BOKITEST')}`;

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải cấu hình cổng thanh toán...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div>
          <div className={styles.actionBarTitle}>Cấu Hình Cổng Thanh Toán Trực Tuyến</div>
          <div className={styles.actionBarDesc}>
            Thiết lập tài khoản ngân hàng SePay (VietQR), ví MoMo, VNPay Gateway và quản lý Webhook IPN
          </div>
        </div>
        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu Cấu Hình Thanh Toán'}
        </button>
      </div>

      <div className={styles.gatewayGrid}>
        {/* 1. SePay VietQR Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardBrand}>
              <Image
                src="/wallets/sepay.png"
                alt="SePay Logo"
                width={36}
                height={36}
                className={styles.brandLogo}
              />
              <div>
                <div className={styles.brandName}>Chuyển Khoản Ngân Hàng Tự Động (SePay VietQR)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Khách quét mã VietQR qua app ngân hàng ➔ Tiền vào tài khoản ➔ SePay gửi Webhook xác nhận tức thì
                </div>
              </div>
            </div>
            <span className={styles.badgeActive}>● Tích hợp trực tiếp</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mã Ngân Hàng (Bank Code)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: MBBank, VCB, TCB, ACB, TPB..."
                  value={sepayBank}
                  onChange={(e) => setSepayBank(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Số Tài Khoản Ngân Hàng</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: 0868889999"
                  value={sepayAccount}
                  onChange={(e) => setSepayAccount(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tên Chủ Tài Khoản (In hoa không dấu)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: CONG TY CO PHAN BOKI STORE"
                  value={sepayName}
                  onChange={(e) => setSepayName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>SePay API Key (Webhook Token)</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Token xác thực SePay gửi kèm webhook"
                  value={sepayApiKey}
                  onChange={(e) => setSepayApiKey(e.target.value)}
                />
              </div>
            </div>

            {/* Webhook URL for SePay */}
            <div className={styles.webhookBox}>
              <div className={styles.webhookHeader}>
                <span>🔗 Webhook URL tiếp nhận IPN từ SePay</span>
                <a
                  href="https://my.sepay.vn"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#ea580c', textDecoration: 'underline' }}
                >
                  Mở Cổng Quản Trị my.sepay.vn ↗
                </a>
              </div>
              <div className={styles.webhookUrlRow}>
                <code className={styles.urlCode}>{`${getOrigin()}/api/webhooks/sepay`}</code>
                <button
                  type="button"
                  className={styles.copyUrlBtn}
                  onClick={() => copyToClipboard(`${getOrigin()}/api/webhooks/sepay`, 'sepay')}
                >
                  {copiedKey === 'sepay' ? '✓ Đã sao chép' : '📋 Sao chép URL'}
                </button>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#7c2d12', lineHeight: '1.5' }}>
                📌 <strong>Hướng dẫn cài đặt:</strong> Đăng nhập <strong>my.sepay.vn</strong> ➔ Chọn Tích hợp Webhook ➔ Thêm mới Webhook: dán URL trên, chọn kiểu JSON, và nhập API Key trùng khớp với trường ở trên để bảo mật.
              </div>
            </div>

            {/* Live VietQR Preview */}
            <div className={styles.previewQrRow}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sampleQrUrl} alt="VietQR Sample" className={styles.qrSample} />
              <div className={styles.qrSampleText}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>👁️ Xem Trước Mã VietQR Tự Động (Live Preview)</div>
                <div>Ngân hàng: <strong>{sepayBank}</strong> | STK: <strong>{sepayAccount}</strong></div>
                <div>Chủ tài khoản: <strong>{sepayName}</strong></div>
                <div style={{ color: '#ea580c', fontWeight: 600 }}>Cú pháp mẫu: {simCode || 'BOKITEST'} - Số tiền: 50,000₫</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mã QR trên được tạo động chuẩn VietQR Napas247 tương thích 100% app ngân hàng tại Việt Nam.</div>
              </div>
            </div>

            {/* SePay Webhook Simulator */}
            <div className={styles.simulatorBox}>
              <div className={styles.simTitle}>Thử Nghiệm Mô Phỏng Webhook SePay (Realtime Simulator)</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Nhập mã thanh toán (Payment Code của đơn hàng) để giả lập sự kiện khách hàng đã chuyển khoản thành công vào tài khoản.
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mã Thanh Toán Cần Test (Payment Code)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="VD: BOKI3E9FA120"
                    value={simCode}
                    onChange={(e) => setSimCode(e.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Số Tiền Giả Lập (VNĐ)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value) || 0)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nội Dung Chuyển Tiền Giả Lập</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={simContent}
                    onChange={(e) => setSimContent(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className={styles.simBtn}
                onClick={handleSimulateWebhook}
                disabled={simulating}
              >
                {simulating ? 'Đang gửi...' : 'Bắn Test Webhook SePay'}
              </button>

              {simResult && (
                <div
                  className={`${styles.simResult} ${simResult.success ? styles.simSuccess : styles.simError}`}
                >
                  {simResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. MoMo Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardBrand}>
              <Image
                src="/wallets/momo.png"
                alt="MoMo Logo"
                width={36}
                height={36}
                className={styles.brandLogo}
              />
              <div>
                <div className={styles.brandName}>Ví Điện Tử MoMo (Gateway v2 API)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Thanh toán qua ứng dụng Ví MoMo bằng mã QR hoặc DeepLink trên điện thoại
                </div>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={momoSandbox}
                onChange={(e) => setMomoSandbox(e.target.checked)}
              />
              <span>Chế độ Sandbox (Thử nghiệm)</span>
            </label>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Partner Code</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Mã đối tác MoMo cấp (VD: MOMO)"
                  value={momoPartnerCode}
                  onChange={(e) => setMomoPartnerCode(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Access Key</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Access Key MoMo cấp"
                  value={momoAccessKey}
                  onChange={(e) => setMomoAccessKey(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Secret Key</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Secret Key dùng tạo chữ ký HMAC-SHA256"
                  value={momoSecretKey}
                  onChange={(e) => setMomoSecretKey(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.webhookBox}>
              <div className={styles.webhookHeader}>
                <span>🔗 MoMo IPN Callback URL</span>
                <span style={{ fontSize: '0.75rem', color: '#a16207' }}>Tự động gửi kèm payload tạo thanh toán</span>
              </div>
              <div className={styles.webhookUrlRow}>
                <code className={styles.urlCode}>{`${getOrigin()}/api/webhooks/momo`}</code>
                <button
                  type="button"
                  className={styles.copyUrlBtn}
                  onClick={() => copyToClipboard(`${getOrigin()}/api/webhooks/momo`, 'momo')}
                >
                  {copiedKey === 'momo' ? '✓ Đã sao chép' : '📋 Sao chép URL'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. VNPay Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardBrand}>
              <Image
                src="/wallets/vnpay.png"
                alt="VNPay Logo"
                width={36}
                height={36}
                className={styles.brandLogo}
              />
              <div>
                <div className={styles.brandName}>Cổng Thanh Toán VNPay (v2.1.0)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Quét VNPay-QR trên 40+ app ngân hàng, thẻ ATM nội địa và thẻ quốc tế Visa/Mastercard
                </div>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={vnpaySandbox}
                onChange={(e) => setVnpaySandbox(e.target.checked)}
              />
              <span>Chế độ Sandbox (Thử nghiệm)</span>
            </label>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mã Định Danh Website (vnp_TmnCode)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: BOKIST01"
                  value={vnpayTmnCode}
                  onChange={(e) => setVnpayTmnCode(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Chuỗi Bí Mật Tạo Checksum (vnp_HashSecret)</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Hash Secret HMAC-SHA512"
                  value={vnpayHashSecret}
                  onChange={(e) => setVnpayHashSecret(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.webhookBox}>
              <div className={styles.webhookHeader}>
                <span>🔗 VNPay Return & IPN URL</span>
                <span style={{ fontSize: '0.75rem', color: '#a16207' }}>Khai báo trên Merchant Portal VNPay</span>
              </div>
              <div className={styles.webhookUrlRow}>
                <code className={styles.urlCode}>{`${getOrigin()}/checkout/payment-return?method=VNPAY`}</code>
                <button
                  type="button"
                  className={styles.copyUrlBtn}
                  onClick={() => copyToClipboard(`${getOrigin()}/checkout/payment-return?method=VNPAY`, 'vnpay')}
                >
                  {copiedKey === 'vnpay' ? '✓ Đã sao chép' : '📋 Sao chép URL'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. COD Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardBrand}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                💵
              </div>
              <div>
                <div className={styles.brandName}>Thanh Toán Khi Nhận Hàng (COD - Cash On Delivery)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Khách hàng thanh toán tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sách
                </div>
              </div>
            </div>
            <span className={styles.badgeActive}>● Mặc định luôn bật</span>
          </div>
        </div>
      </div>
    </div>
  );
}
