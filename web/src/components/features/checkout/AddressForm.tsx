'use client';

import React, { useEffect, useState } from 'react';
import { locationService, Province, District, Ward } from '@/services/locationService';
import styles from './AddressForm.module.css';

export interface AddressFormData {
  fullName: string;
  phoneNumber: string;
  email?: string;
  province: string;
  provinceCode: number | null;
  district: string;
  districtCode: number | null;
  ward: string;
  wardCode: number | null;
  streetAddress: string;
  note: string;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (updatedData: Partial<AddressFormData>) => void;
  errors?: Record<string, string>;
  isGuest?: boolean;
}

export default function AddressForm({ formData, onChange, errors = {}, isGuest = false }: AddressFormProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // 1. Fetch Provinces on mount
  useEffect(() => {
    async function loadProvinces() {
      setLoadingProvinces(true);
      try {
        const list = await locationService.getProvinces();
        setProvinces(list);
      } finally {
        setLoadingProvinces(false);
      }
    }
    loadProvinces();
  }, []);

  // 2. Fetch Districts when provinceCode changes
  useEffect(() => {
    if (!formData.provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }

    async function loadDistricts() {
      setLoadingDistricts(true);
      try {
        const list = await locationService.getDistricts(formData.provinceCode!);
        setDistricts(list);
      } finally {
        setLoadingDistricts(false);
      }
    }
    loadDistricts();
  }, [formData.provinceCode]);

  // 3. Fetch Wards when districtCode changes
  useEffect(() => {
    if (!formData.districtCode) {
      setWards([]);
      return;
    }

    async function loadWards() {
      setLoadingWards(true);
      try {
        const list = await locationService.getWards(formData.districtCode!);
        setWards(list);
      } finally {
        setLoadingWards(false);
      }
    }
    loadWards();
  }, [formData.districtCode]);

  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    if (!code) {
      onChange({
        province: '',
        provinceCode: null,
        district: '',
        districtCode: null,
        ward: '',
        wardCode: null,
      });
      return;
    }

    const found = provinces.find((p) => p.code === code);
    onChange({
      province: found ? found.name : '',
      provinceCode: code,
      district: '',
      districtCode: null,
      ward: '',
      wardCode: null,
    });
  };

  const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    if (!code) {
      onChange({
        district: '',
        districtCode: null,
        ward: '',
        wardCode: null,
      });
      return;
    }

    const found = districts.find((d) => d.code === code);
    onChange({
      district: found ? found.name : '',
      districtCode: code,
      ward: '',
      wardCode: null,
    });
  };

  const handleWardSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    if (!code) {
      onChange({
        ward: '',
        wardCode: null,
      });
      return;
    }

    const found = wards.find((w) => w.code === code);
    onChange({
      ward: found ? found.name : '',
      wardCode: code,
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerIcon}>📍</div>
        <h2 className={styles.cardTitle}>Thông tin giao hàng</h2>
      </div>

      <div className={styles.formGrid}>
        {/* Full Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Họ và tên người nhận<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="Ví dụ: Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
          />
          {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
        </div>

        {/* Phone Number */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Số điện thoại nhận hàng<span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            className={styles.input}
            placeholder="Ví dụ: 0912345678"
            value={formData.phoneNumber}
            onChange={(e) => onChange({ phoneNumber: e.target.value })}
          />
          {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
        </div>

        {/* Email Address (Mandatory for Guest to track orders) */}
        <div className={`${styles.fieldGroup} ${isGuest ? styles.fullWidth : ''}`}>
          <label className={styles.label}>
            Email nhận thông tin đơn hàng{isGuest && <span className={styles.required}>*</span>}
          </label>
          <input
            type="email"
            className={styles.input}
            placeholder="Ví dụ: khachhang@gmail.com"
            value={formData.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        {/* Province / City Select */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Tỉnh / Thành phố<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={formData.provinceCode || ''}
            onChange={handleProvinceSelect}
            disabled={loadingProvinces}
          >
            <option value="">
              {loadingProvinces ? '-- Đang tải Tỉnh/Thành... --' : '-- Chọn Tỉnh / Thành phố --'}
            </option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.province && <span className={styles.errorText}>{errors.province}</span>}
        </div>

        {/* District Select */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Quận / Huyện<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={formData.districtCode || ''}
            onChange={handleDistrictSelect}
            disabled={!formData.provinceCode || loadingDistricts}
          >
            <option value="">
              {!formData.provinceCode
                ? '-- Vui lòng chọn Tỉnh/TP trước --'
                : loadingDistricts
                ? '-- Đang tải Quận/Huyện... --'
                : '-- Chọn Quận / Huyện --'}
            </option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.district && <span className={styles.errorText}>{errors.district}</span>}
        </div>

        {/* Ward Select */}
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>
            Xã / Phường / Thị trấn<span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={formData.wardCode || ''}
            onChange={handleWardSelect}
            disabled={!formData.districtCode || loadingWards}
          >
            <option value="">
              {!formData.districtCode
                ? '-- Vui lòng chọn Quận/Huyện trước --'
                : loadingWards
                ? '-- Đang tải Xã/Phường... --'
                : '-- Chọn Xã / Phường / Thị trấn --'}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
          {errors.ward && <span className={styles.errorText}>{errors.ward}</span>}
        </div>

        {/* Street Address */}
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>
            Địa chỉ chi tiết (Số nhà, tên đường...)<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="Ví dụ: Số 123, Đường Lê Lợi, Tòa nhà A..."
            value={formData.streetAddress}
            onChange={(e) => onChange({ streetAddress: e.target.value })}
          />
          {errors.streetAddress && <span className={styles.errorText}>{errors.streetAddress}</span>}
        </div>

        {/* Note */}
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Ghi chú giao hàng (Tùy chọn)</label>
          <textarea
            rows={2}
            className={styles.textarea}
            placeholder="Ghi chú thêm cho shipper (Ví dụ: Giao giờ hành chính, gọi trước khi giao...)"
            value={formData.note}
            onChange={(e) => onChange({ note: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
