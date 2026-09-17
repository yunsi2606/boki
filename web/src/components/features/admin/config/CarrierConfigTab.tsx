'use client';

import React, { useState, useEffect } from 'react';
import type { CarrierConfig } from '@/types';
import { adminService } from '@/services/adminService';
import { defaultCarrierConfigs } from '@/config/carrierConfig';
import styles from './CarrierConfigTab.module.css';

interface CarrierConfigTabProps {
  onSuccessNotice?: (msg: string) => void;
}

export function CarrierConfigTab({ onSuccessNotice }: CarrierConfigTabProps) {
  const [carriers, setCarriers] = useState<CarrierConfig[]>(defaultCarrierConfigs);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Webhook Simulator state
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);
  const [simOrderCode, setSimOrderCode] = useState<string>('L8TYX6');
  const [simStatus, setSimStatus] = useState<string>('delivering');
  const [simShipper, setSimShipper] = useState<string>('Nguyễn Văn Shipper - 0901234567');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await adminService.getShippingCarriers();
        setCarriers(data);
      } catch (err) {
        console.error('Failed to load shipping carriers config', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggleActive = (code: string) => {
    setCarriers((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleUpdateField = <K extends keyof CarrierConfig>(
    code: string,
    field: K,
    value: CarrierConfig[K]
  ) => {
    setCarriers((prev) =>
      prev.map((c) => (c.code === code ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updateShippingCarriers(carriers);
      if (onSuccessNotice) {
        onSuccessNotice('Đã lưu cấu hình các đơn vị vận chuyển thành công!');
      } else {
        alert('Đã lưu cấu hình đơn vị vận chuyển thành công!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục danh sách và phí ĐVVC về mặc định ban đầu không?')) {
      setCarriers(defaultCarrierConfigs);
    }
  };

  const getWebhookUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/webhooks/ghn`;
    }
    return 'https://boki.store/api/webhooks/ghn';
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(getWebhookUrl());
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSimulateWebhook = async () => {
    if (!simOrderCode.trim()) {
      alert('Vui lòng nhập mã vận đơn để thử nghiệm!');
      return;
    }
    setSimulating(true);
    setSimResult(null);
    try {
      const payload = {
        OrderCode: simOrderCode.trim(),
        Status: simStatus,
        Type: 'switch_status',
        Description:
          simStatus === 'delivering'
            ? 'Bưu tá đang trên đường giao hàng'
            : simStatus === 'delivered'
              ? 'Đã giao hàng thành công đến tay người nhận'
              : simStatus === 'delivery_fail'
                ? 'Giao hàng thất bại (khách hẹn giao lại)'
                : simStatus === 'return'
                  ? 'Hoàn hàng về kho người gửi'
                  : 'Đơn vị vận chuyển báo hủy đơn',
        ShipperName: simShipper.split('-')[0]?.trim() || 'Bưu tá GHN',
        ShipperPhone: simShipper.split('-')[1]?.trim() || '0901234567',
        TotalFee: 24000,
        CODAmount: 50000,
      };

      const res = await adminService.simulateCarrierWebhook(payload);
      setSimResult(`✅ Đã đồng bộ thành công! Trạng thái đơn: ${res.status} | ĐVVC: ${res.carrierStatus || simStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi mô phỏng webhook';
      setSimResult(`❌ Lỗi: ${msg}`);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải cấu hình ĐVVC...</div>;
  }

  const activeCount = carriers.filter((c) => c.isActive).length;

  return (
    <div className={styles.carrierTabContainer}>
      {/* Action Bar */}
      <div className={styles.tabActionBar}>
        <div className={styles.actionBarInfo}>
          <div className={styles.actionBarTitle}>
            Cấu Hình Đơn Vị Vận Chuyển ({activeCount}/{carriers.length} đang bật)
          </div>
          <div className={styles.actionBarDesc}>
            Bật/tắt các hãng vận chuyển, chỉnh giá cước cơ bản và thiết lập thông số kết nối API
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button type="button" className={styles.resetBtn} onClick={handleResetDefaults} disabled={saving}>
            ↺ Mặc định
          </button>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu Cấu Hình ĐVVC'}
          </button>
        </div>
      </div>

      {/* Webhook Configuration & Simulator Card */}
      <div className={styles.webhookCard}>
        <div className={styles.webhookHeader}>
          <div className={styles.webhookTitle}>
            <span>🔗</span>
            <span>Đồng Bộ Trạng Thái Tự Động Qua Webhook (GHN Order Status Callback)</span>
          </div>
          <a
            href="https://developer.ghn.vn/account/webhook"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
          >
            Mở Cổng Cấu Hình Webhook GHN ↗
          </a>
        </div>

        <div className={styles.webhookUrlRow}>
          <input
            type="text"
            readOnly
            value={getWebhookUrl()}
            className={styles.webhookUrlInput}
            title="Địa chỉ Endpoint Webhook tiếp nhận callback từ GHN"
          />
          <button type="button" className={styles.copyWebhookBtn} onClick={handleCopyWebhook}>
            {copiedWebhook ? '✓ Đã sao chép!' : 'Sao chép Webhook URL'}
          </button>
        </div>

        <div className={styles.webhookInstructions}>
          <strong>📌 Hướng dẫn kích hoạt trên GHN:</strong>
          <br />
          1. Đăng nhập cổng <a href="https://developer.ghn.vn" target="_blank" rel="noreferrer" style={{ color: '#15803d', fontWeight: 700 }}>developer.ghn.vn</a> (hoặc developer.ghn.dev) ➔ Menu tài khoản góc phải ➔ <strong>"Cấu hình webhook"</strong>.
          <br />
          2. Tại tab <strong>Order Status Callback</strong>, dán URL trên vào và bấm <strong>Tạo webhook</strong>.
          <br />
          3. Khi đơn hàng có sự kiện (Lấy hàng, Đang giao, Giao thành công, Hoàn hàng, Hủy...), GHN sẽ tự động gọi URL này để cập nhật trạng thái đơn hàng trên Boki ngay lập tức.
        </div>

        {/* Webhook Simulator */}
        <div className={styles.simulatorBox}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
            Thử Nghiệm Mô Phỏng Webhook GHN Callback (Realtime Test)
          </div>
          <div className={styles.simRow}>
            <div>
              <input
                type="text"
                placeholder="Mã vận đơn GHN (VD: L8TYX6)"
                value={simOrderCode}
                onChange={(e) => setSimOrderCode(e.target.value.toUpperCase())}
                className={styles.inputControl}
                style={{ fontSize: '0.825rem', padding: '6px 10px' }}
              />
            </div>
            <div>
              <select
                value={simStatus}
                onChange={(e) => setSimStatus(e.target.value)}
                className={styles.inputControl}
                style={{ fontSize: '0.825rem', padding: '6px 10px' }}
              >
                <option value="delivering">delivering (Đang giao hàng)</option>
                <option value="delivered">delivered (Đã giao thành công)</option>
                <option value="delivery_fail">delivery_fail (Giao thất bại)</option>
                <option value="return">return (Hoàn hàng về shop)</option>
                <option value="cancel">cancel (Hủy đơn hàng)</option>
                <option value="picked">picked (Đã lấy hàng về kho)</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Tên shipper & SĐT"
                value={simShipper}
                onChange={(e) => setSimShipper(e.target.value)}
                className={styles.inputControl}
                style={{ fontSize: '0.825rem', padding: '6px 10px' }}
              />
            </div>
            <div>
              <button
                type="button"
                className={styles.saveBtn}
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#0284c7' }}
                onClick={handleSimulateWebhook}
                disabled={simulating}
              >
                {simulating ? 'Đang gửi...' : '🚀 Gửi Sự Kiện'}
              </button>
            </div>
          </div>
          {simResult && (
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: simResult.startsWith('✅') ? '#166534' : '#dc2626',
                background: simResult.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid ' + (simResult.startsWith('✅') ? '#bbf7d0' : '#fecaca'),
              }}
            >
              {simResult}
            </div>
          )}
        </div>
      </div>

      {/* Carriers List */}
      <div className={styles.carrierList}>
        {carriers.map((carrier) => (
          <div
            key={carrier.code}
            className={`${styles.carrierCard} ${!carrier.isActive ? styles.carrierCardInactive : ''}`}
          >
            {/* Header */}
            <div className={styles.cardHeader}>
              <div className={styles.carrierIdentity}>
                <div className={styles.carrierLogoWrapper}>
                  {carrier.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={carrier.logo} alt={carrier.name} className={styles.carrierLogoImg} />
                  ) : (
                    <span className={styles.carrierFallbackIcon}>🚚</span>
                  )}
                </div>
                <div>
                  <div className={styles.carrierTitleRow}>
                    <span className={styles.carrierName}>{carrier.name}</span>
                    <span className={styles.carrierCodeBadge}>{carrier.code}</span>
                  </div>
                  <div className={styles.carrierDescription}>{carrier.notes || `Đối tác vận chuyển ${carrier.name}`}</div>
                </div>
              </div>

              <div className={styles.toggleWrapper}>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={carrier.isActive}
                    onChange={() => handleToggleActive(carrier.code)}
                  />
                  <span className={styles.toggleSlider} />
                </label>
                <span className={carrier.isActive ? styles.statusActiveText : styles.statusInactiveText}>
                  {carrier.isActive ? 'Đang bật' : 'Tắt'}
                </span>
              </div>
            </div>

            {/* Config Fields */}
            <div className={styles.cardBody}>
              <div className={styles.fieldsGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Phí cơ bản (0 - 500g)</label>
                  <div className={styles.inputWithSuffix}>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className={styles.inputControl}
                      value={carrier.baseFee}
                      onChange={(e) => handleUpdateField(carrier.code, 'baseFee', Number(e.target.value) || 0)}
                    />
                    <span className={styles.fieldSuffix}>₫</span>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Phí tăng mỗi 500g tiếp theo</label>
                  <div className={styles.inputWithSuffix}>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      className={styles.inputControl}
                      value={carrier.weightStepFee}
                      onChange={(e) => handleUpdateField(carrier.code, 'weightStepFee', Number(e.target.value) || 0)}
                    />
                    <span className={styles.fieldSuffix}>₫</span>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Thời gian giao dự kiến</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    placeholder="VD: 1 - 2 ngày"
                    value={carrier.deliveryDays}
                    onChange={(e) => handleUpdateField(carrier.code, 'deliveryDays', e.target.value)}
                  />
                </div>
              </div>

              {/* API Connection Box */}
              <div className={styles.apiBox}>
                <div className={styles.apiBoxHeader}>
                  <div className={styles.apiBoxTitle}>Thông số kết nối API Gateway & Webhook</div>
                  <label className={styles.sandboxCheckbox}>
                    <input
                      type="checkbox"
                      checked={carrier.isSandbox}
                      onChange={(e) => handleUpdateField(carrier.code, 'isSandbox', e.target.checked)}
                    />
                    <span>Chế độ Sandbox (Thử nghiệm)</span>
                  </label>
                </div>

                <div className={styles.apiFieldsRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>API Token / Secret Key</label>
                    <input
                      type="password"
                      className={styles.inputControl}
                      placeholder="Nhập API Token đối tác cấp"
                      value={carrier.apiToken || ''}
                      onChange={(e) => handleUpdateField(carrier.code, 'apiToken', e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Mã Cửa Hàng / Shop ID / Client ID</label>
                    <input
                      type="text"
                      className={styles.inputControl}
                      placeholder="VD: 182736 hoặc CLIENT_KEY"
                      value={carrier.shopId || ''}
                      onChange={(e) => handleUpdateField(carrier.code, 'shopId', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.apiFieldsRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>URL Gateway Sandbox (Endpoint dev)</label>
                    <input
                      type="text"
                      className={styles.inputControl}
                      placeholder="Endpoint Sandbox..."
                      value={carrier.sandboxEndpoint || ''}
                      onChange={(e) => handleUpdateField(carrier.code, 'sandboxEndpoint', e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>URL Gateway Production (Endpoint thật)</label>
                    <input
                      type="text"
                      className={styles.inputControl}
                      placeholder="Endpoint Production..."
                      value={carrier.productionEndpoint || ''}
                      onChange={(e) => handleUpdateField(carrier.code, 'productionEndpoint', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CarrierConfigTab;
