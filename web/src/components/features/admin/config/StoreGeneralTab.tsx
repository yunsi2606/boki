'use client';

import React, { useState, useEffect } from 'react';
import type { StoreGeneralConfig } from '@/types';
import { adminService } from '@/services/adminService';
import { defaultStoreGeneralConfig } from '@/config/carrierConfig';
import styles from './StoreGeneralTab.module.css';

interface StoreGeneralTabProps {
  onSuccessNotice?: (msg: string) => void;
}

export function StoreGeneralTab({ onSuccessNotice }: StoreGeneralTabProps) {
  const [config, setConfig] = useState<StoreGeneralConfig>(defaultStoreGeneralConfig);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await adminService.getStoreGeneralConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load store general config', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field: keyof StoreGeneralConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateStoreGeneralConfig(config);
      if (onSuccessNotice) {
        onSuccessNotice('Đã lưu cấu hình thông tin cửa hàng thành công!');
      } else {
        alert('Đã lưu cấu hình thông tin cửa hàng thành công!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải cài đặt chung...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.generalContainer}>
      <div className={styles.configCard}>
        <div className={styles.cardTitle}>
          <span>🏪</span>
          <span>Thông Tin Doanh Nghiệp & Kho Hàng Xuất Đơn</span>
        </div>

        <div className={styles.fieldsGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tên Cửa Hàng / Thương Hiệu</label>
            <input
              type="text"
              className={styles.inputControl}
              value={config.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              placeholder="VD: Boki Bookstore"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Hotline Hỗ Trợ Khách Hàng</label>
            <input
              type="text"
              className={styles.inputControl}
              value={config.hotline}
              onChange={(e) => handleChange('hotline', e.target.value)}
              placeholder="VD: 1900 8888"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Email Liên Hệ / CSKH</label>
            <input
              type="email"
              className={styles.inputControl}
              value={config.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="VD: support@boki.vn"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Số Điện Thoại Người Gửi (In Vận Đơn)</label>
            <input
              type="text"
              className={styles.inputControl}
              value={config.senderPhone}
              onChange={(e) => handleChange('senderPhone', e.target.value)}
              placeholder="VD: 0901234567"
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Địa Chỉ Kho Lấy Hàng / Người Gửi (In Vận Đơn A5/A6)</label>
          <input
            type="text"
            className={styles.inputControl}
            value={config.senderAddress}
            onChange={(e) => handleChange('senderAddress', e.target.value)}
            placeholder="VD: Số 123 Đường Sách, Q. 1, TP. Hồ Chí Minh"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Ghi Chú Giao Hàng Mặc Định Cho Shipper</label>
          <textarea
            className={styles.textareaControl}
            value={config.defaultShippingNote}
            onChange={(e) => handleChange('defaultShippingNote', e.target.value)}
            placeholder="VD: Cho xem hàng, không cho thử. Hàng sách bọc xốp cẩn thận."
          />
        </div>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Đang lưu...' : '💾 Lưu Cài Đặt Chung'}
        </button>
      </div>
    </form>
  );
}

export default StoreGeneralTab;
