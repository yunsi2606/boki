'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { voiceAlertService } from '@/services/voiceAlertService';
import type { FraudAlertEvent } from '@/types';
import styles from './FraudAutopilotConfigTab.module.css';

interface FraudAutopilotConfigTabProps {
  onSuccessNotice?: (msg: string) => void;
}

export default function FraudAutopilotConfigTab({ onSuccessNotice }: FraudAutopilotConfigTabProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Autopilot & Fraud engine parameters
  const [autopilotEnabled, setAutopilotEnabled] = useState<boolean>(true);
  const [guestMaxAmount, setGuestMaxAmount] = useState<number>(1500000);
  const [codMaxAmount, setCodMaxAmount] = useState<number>(2000000);
  const [riskThreshold, setRiskThreshold] = useState<number>(60);
  const [voiceAlertEnabled, setVoiceAlertEnabled] = useState<boolean>(true);

  // Simulator testbench state
  const [simAmount, setSimAmount] = useState<number>(2850000);
  const [simCustomer, setSimCustomer] = useState<string>('Khách vãng lai (Nguyễn Văn Hùng)');
  const [simPhone, setSimPhone] = useState<string>('0988889999');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [lastSimResult, setLastSimResult] = useState<FraudAlertEvent | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const configs = await adminService.getAutopilotConfigs();
        if (configs['autopilot_enabled'] !== undefined) {
          setAutopilotEnabled(configs['autopilot_enabled'] === 'true');
        }
        if (configs['fraud_guest_max_amount']) {
          setGuestMaxAmount(Number(configs['fraud_guest_max_amount']) || 1500000);
        }
        if (configs['fraud_cod_max_amount']) {
          setCodMaxAmount(Number(configs['fraud_cod_max_amount']) || 2000000);
        }
        if (configs['fraud_risk_threshold']) {
          setRiskThreshold(Number(configs['fraud_risk_threshold']) || 60);
        }
        if (configs['fraud_voice_alert_enabled'] !== undefined) {
          setVoiceAlertEnabled(configs['fraud_voice_alert_enabled'] === 'true');
        }
      } catch (err) {
        console.error('Failed to load autopilot configs', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: Record<string, string> = {
        autopilot_enabled: String(autopilotEnabled),
        fraud_guest_max_amount: String(guestMaxAmount),
        fraud_cod_max_amount: String(codMaxAmount),
        fraud_risk_threshold: String(riskThreshold),
        fraud_voice_alert_enabled: String(voiceAlertEnabled),
      };

      await adminService.updateAutopilotConfigs(payload);
      if (onSuccessNotice) {
        onSuccessNotice('Đã lưu cấu hình AI Fraud Detection & Autopilot Duyệt Đơn thành công!');
      } else {
        alert('Đã lưu cấu hình thành công!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateAlert = async () => {
    try {
      setSimulating(true);
      const event = await adminService.simulateFraudOrder({
        amount: simAmount,
        customerName: simCustomer,
        customerPhone: simPhone,
      });
      setLastSimResult(event);

      // Play local voice alert test if enabled
      if (voiceAlertEnabled) {
        voiceAlertService.playFraudVoiceAlert(event.voiceMessage);
      }

      if (onSuccessNotice) {
        onSuccessNotice(`Đã bắn thành công cảnh báo giả lập cho đơn ${event.orderCode}! Kiểm tra Dashboard & Tab Đơn Khả Nghi.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi bắn cảnh báo giả lập';
      alert(msg);
    } finally {
      setSimulating(false);
    }
  };

  const handleTestVoiceAudio = () => {
    voiceAlertService.speak(
      'Cảnh báo: Phát hiện đơn hàng khả nghi có rủi ro cao từ tài khoản vãng lai! Hệ thống Autopilot đã tạm giữ đơn, yêu cầu kiểm tra thủ công!'
    );
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải thông số Autopilot AI...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Top Action Bar */}
      <div className={styles.actionBar}>
        <div>
          <div className={styles.actionBarTitle}>
            <span>🤖</span>
            <span>Hệ Thống Đánh Giá Rủi Ro AI & Autopilot Duyệt Đơn</span>
          </div>
          <div className={styles.actionBarDesc}>
            Phân tích hành vi đơn hàng ngầm, tự động duyệt đơn hợp lệ và kích hoạt cảnh báo giọng nói thời gian thực.
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={styles.saveBtn}
        >
          {saving ? 'Đang lưu...' : '💾 Lưu Cấu Hình Autopilot'}
        </button>
      </div>

      {/* Settings Grid */}
      <div className={styles.sectionGridTwoCol}>
        {/* Left Column: Autopilot Engine Settings */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardBrand}>
              <div className={styles.brandIcon}>🚀</div>
              <div>
                <div className={styles.brandTitle}>Autopilot Quy Trình Duyệt Đơn</div>
              </div>
            </div>
            <span className={autopilotEnabled ? styles.badgeActive : styles.badgeDisabled}>
              {autopilotEnabled ? '● Đang Hoạt Động' : '○ Đang Tắt'}
            </span>
          </div>

          <div className={styles.cardBody}>
            {/* Autopilot Switch */}
            <div className={styles.toggleRow}>
              <div className={styles.toggleMeta}>
                <span className={styles.toggleLabel}>Bật Tính Năng Autopilot Duyệt Tự Động</span>
                <span className={styles.toggleHint}>
                  Tự động chuyển trạng thái PENDING ➔ CONFIRMED cho đơn hàng an toàn. Khi phát hiện đơn khả nghi, hệ thống lập tức dừng duyệt và chuyển vào danh sách kiểm tra thủ công.
                </span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={autopilotEnabled}
                  onChange={(e) => setAutopilotEnabled(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>

            {/* Voice Alert Switch */}
            <div className={styles.toggleRow}>
              <div className={styles.toggleMeta}>
                <span className={styles.toggleLabel}>Cảnh Báo Giọng Nói Thời Gian Thực (Voice Alert)</span>
                <span className={styles.toggleHint}>
                  Tự động phát chuông cảnh báo hai âm sắc (Two-tone Chime) và đọc thông báo tiếng Việt khi phát hiện giao dịch bất thường.
                </span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={voiceAlertEnabled}
                  onChange={(e) => setVoiceAlertEnabled(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>

            {/* Risk Threshold Slider */}
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>
                <span>Ngưỡng Điểm Rủi Ro Kích Hoạt Cảnh Báo (Risk Threshold)</span>
                <span style={{ color: riskThreshold >= 60 ? '#ef4444' : '#6366f1', fontWeight: 700 }}>
                  {riskThreshold} / 100 điểm
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="5"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className={styles.sliderRange}
              />
              <div className={styles.rangeScale}>
                <span>30 (Nhạy cảm cao)</span>
                <span>60 (Khuyến nghị chuẩn)</span>
                <span>90 (Chỉ cảnh báo cực độ)</span>
              </div>

              <div className={styles.scoreVisualizer}>
                <div className={styles.meterBar}>
                  <div
                    className={styles.meterPin}
                    style={{ left: `${riskThreshold}%` }}
                    title={`Ngưỡng ${riskThreshold}`}
                  />
                </div>
                <span>
                  {riskThreshold >= 70 ? '🔴 Ngắt duyệt mạnh' : riskThreshold >= 50 ? '🟡 Cân bằng' : '🟢 Giám sát chặt'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Limits & Rule Weights */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardBrand}>
              <div className={styles.brandIcon}>🛡️</div>
              <div>
                <div className={styles.brandTitle}>Ngưỡng Tài Chính & Quy Tắc Đánh Giá</div>
              </div>
            </div>
          </div>

          <div className={styles.cardBody}>
            {/* Guest Max Amount */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <span>Hạn Mức Đơn Hàng Khách Vãng Lai (Guest Max Amount)</span>
                <span style={{ color: '#64748b' }}>Đơn vị: VNĐ</span>
              </label>
              <input
                type="number"
                step="100000"
                value={guestMaxAmount}
                onChange={(e) => setGuestMaxAmount(Number(e.target.value))}
                className={styles.inputField}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Khách không đăng nhập đặt đơn vượt quá <strong>{guestMaxAmount.toLocaleString('vi-VN')} đ</strong> sẽ bị cộng +50 điểm rủi ro.
              </span>
            </div>

            {/* COD Max Amount */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <span>Hạn Mức Thanh Toán COD Tối Đa (COD Max Amount)</span>
                <span style={{ color: '#64748b' }}>Đơn vị: VNĐ</span>
              </label>
              <input
                type="number"
                step="100000"
                value={codMaxAmount}
                onChange={(e) => setCodMaxAmount(Number(e.target.value))}
                className={styles.inputField}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Đơn COD vượt quá <strong>{codMaxAmount.toLocaleString('vi-VN')} đ</strong> sẽ bị đánh giá nguy cơ boom hàng và cộng +25 điểm.
              </span>
            </div>

            {/* Rule Weight Breakdown */}
            <div className={styles.infoBox}>
              <strong>5 Tiêu Chí Chấm Điểm Độc Quyền Của Boki AI:</strong>
              <div className={styles.ruleList}>
                <div className={styles.ruleItem}>
                  <span className={`${styles.ruleWeight} ${styles.ruleHigh}`}>+50đ</span>
                  <span>Khách vãng lai đột ngột đặt đơn giá trị lớn vượt hạn mức</span>
                </div>
                <div className={styles.ruleItem}>
                  <span className={`${styles.ruleWeight} ${styles.ruleHigh}`}>+35đ</span>
                  <span>Tần suất đặt hàng dồn dập trong 10 phút gần nhất (Velocity Spike)</span>
                </div>
                <div className={styles.ruleItem}>
                  <span className={`${styles.ruleWeight} ${styles.ruleMed}`}>+30đ</span>
                  <span>Số điện thoại lặp số bất thường hoặc địa chỉ giao hàng quá ngắn (&lt; 10 ký tự)</span>
                </div>
                <div className={styles.ruleItem}>
                  <span className={`${styles.ruleWeight} ${styles.ruleMed}`}>+25đ</span>
                  <span>Đơn COD giá trị cao hoặc tài khoản mới 0 ngày đặt đơn đầu tiên</span>
                </div>
                <div className={styles.ruleItem}>
                  <span className={`${styles.ruleWeight} ${styles.ruleLow}`}>+20đ</span>
                  <span>Mua gom số lượng lớn (&gt; 10 cuốn sách trong một đơn)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Live Simulator & Testing Lab */}
      <div className={styles.simulatorBox}>
        <div className={styles.simHeader}>
          <div>
            <div className={styles.simTitle}>
              <span>🧪</span>
              <span>Giả Lập Giao Dịch Rủi Ro & Thử Nghiệm Voice Alert SSE</span>
            </div>
            <div className={styles.simSubtitle}>
              Kích hoạt đơn hàng ảo với điểm rủi ro cao để kiểm tra luồng phát cảnh báo giọng nói và bảng theo dõi đơn khả nghi.
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestVoiceAudio}
            className={styles.simVoiceTestBtn}
            title="Nghe thử âm thanh cảnh báo mẫu"
          >
            🔊 Nghe Thử Voice Alert
          </button>
        </div>

        <div className={styles.simGrid}>
          <div className={styles.inputGroup}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Số tiền đơn hàng giả lập (VNĐ)</label>
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(Number(e.target.value))}
              className={styles.simInput}
            />
          </div>
          <div className={styles.inputGroup}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tên khách hàng</label>
            <input
              type="text"
              value={simCustomer}
              onChange={(e) => setSimCustomer(e.target.value)}
              className={styles.simInput}
            />
          </div>
          <div className={styles.inputGroup}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Số điện thoại</label>
            <input
              type="text"
              value={simPhone}
              onChange={(e) => setSimPhone(e.target.value)}
              className={styles.simInput}
            />
          </div>
        </div>

        <div className={styles.simActions}>
          <button
            type="button"
            disabled={simulating}
            onClick={handleSimulateAlert}
            className={styles.simFireBtn}
          >
            {simulating ? 'Đang gửi sự kiện...' : '🚨 Bắn Cảnh Báo Giả Lập & Thử Voice Alert'}
          </button>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Sự kiện sẽ được truyền trực tiếp qua Server-Sent Events (SSE) tới tất cả các phiên Admin đang mở.
          </span>
        </div>

        {lastSimResult && (
          <div className={styles.simResultCard}>
            <div className={styles.simResultHeader}>
              <span>⚡ ĐÃ PHÁT CẢNH BÁO THỜI GIAN THỰC</span>
              <span>Mã Đơn: {lastSimResult.orderCode} - Điểm: {lastSimResult.riskScore}/100</span>
            </div>
            <div>
              <strong>Thông báo giọng nói:</strong> &quot;{lastSimResult.voiceMessage}&quot;
            </div>
            <div>
              <strong>Lý do AI gắn cờ:</strong>
              <ul className={styles.simReasons}>
                {lastSimResult.riskReasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
