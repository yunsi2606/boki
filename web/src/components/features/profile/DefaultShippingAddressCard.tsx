'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@/types';
import { locationService, Province, District, Ward } from '@/services/locationService';
import { customerProfileService } from '@/services/customerProfileService';
import { MapPinIcon, CheckCircleIcon } from '@/components/ui/LineIcons';
import styles from './profile.module.css';

interface DefaultShippingAddressCardProps {
  user: User;
  onAddressSaved: (updatedUser: User) => void;
}

export default function DefaultShippingAddressCard({ user, onAddressSaved }: DefaultShippingAddressCardProps) {
  const [fullName, setFullName] = useState(user.shippingFullName || user.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.shippingPhone || user.phoneNumber || '');
  const [province, setProvince] = useState(user.shippingProvince || '');
  const [provinceCode, setProvinceCode] = useState<number | null>(user.shippingProvinceCode || null);
  const [district, setDistrict] = useState(user.shippingDistrict || '');
  const [districtCode, setDistrictCode] = useState<number | null>(user.shippingDistrictCode || null);
  const [ward, setWard] = useState(user.shippingWard || '');
  const [wardCode, setWardCode] = useState<number | null>(user.shippingWardCode || null);
  const [streetAddress, setStreetAddress] = useState(user.shippingStreetAddress || '');
  const [note, setNote] = useState(user.shippingDeliveryNote || '');

  // Cascading location lists
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load provinces on mount
  useEffect(() => {
    async function loadProvinces() {
      try {
        const list = await locationService.getProvinces();
        setProvinces(list);
      } catch (err) {
        console.error('Failed to load provinces', err);
      }
    }
    loadProvinces();
  }, []);

  // Load districts when provinceCode changes
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }

    async function loadDistricts() {
      try {
        const list = await locationService.getDistricts(provinceCode!);
        setDistricts(list);
      } catch (err) {
        console.error('Failed to load districts', err);
      }
    }
    loadDistricts();
  }, [provinceCode]);

  // Load wards when districtCode changes
  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      return;
    }

    async function loadWards() {
      try {
        const list = await locationService.getWards(districtCode!);
        setWards(list);
      } catch (err) {
        console.error('Failed to load wards', err);
      }
    }
    loadWards();
  }, [districtCode]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value) || null;
    const selected = provinces.find((p) => p.code === code);
    setProvinceCode(code);
    setProvince(selected ? selected.name : '');
    setDistrictCode(null);
    setDistrict('');
    setWardCode(null);
    setWard('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value) || null;
    const selected = districts.find((d) => d.code === code);
    setDistrictCode(code);
    setDistrict(selected ? selected.name : '');
    setWardCode(null);
    setWard('');
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value) || null;
    const selected = wards.find((w) => w.code === code);
    setWardCode(code);
    setWard(selected ? selected.name : '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại người nhận.');
      return;
    }
    if (!province) {
      setErrorMsg('Vui lòng chọn Tỉnh/Thành phố.');
      return;
    }
    if (!district) {
      setErrorMsg('Vui lòng chọn Quận/Huyện.');
      return;
    }
    if (!ward) {
      setErrorMsg('Vui lòng chọn Phường/Xã.');
      return;
    }
    if (!streetAddress.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ cụ thể (số nhà, ngõ, tên đường).');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await customerProfileService.updateShippingAddress({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        province,
        provinceCode,
        district,
        districtCode,
        ward,
        wardCode,
        streetAddress: streetAddress.trim(),
        note: note.trim() || undefined,
      });

      onAddressSaved(updatedUser);
      setSuccessMsg('Đã lưu địa chỉ giao hàng mặc định thành công!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lưu địa chỉ thất bại. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.addressCardWrapper}>
      <div className={styles.cardSectionHeader}>
        <h2 className={styles.cardSectionTitle}>
          <MapPinIcon size={22} color="#ff4d4f" />
          <span>Sổ Địa Chỉ Giao Hàng Mặc Định</span>
        </h2>
      </div>

      <div className={styles.addressNotice}>
        <CheckCircleIcon size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          Địa chỉ này sẽ được hệ thống <strong>tự động điền sẵn tại trang Thanh toán</strong> để bạn đặt hàng nhanh chóng mà không cần nhập lại!
        </span>
      </div>

      {successMsg && (
        <div style={{ padding: '10px 14px', background: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: '10px', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className={styles.addressForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Họ và tên người nhận</label>
            <input
              type="text"
              required
              className={styles.formInput}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Số điện thoại nhận hàng</label>
            <input
              type="tel"
              required
              className={styles.formInput}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0912345678"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tỉnh / Thành phố</label>
            <select
              className={styles.formSelect}
              value={provinceCode || ''}
              onChange={handleProvinceChange}
              required
            >
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Quận / Huyện</label>
            <select
              className={styles.formSelect}
              value={districtCode || ''}
              onChange={handleDistrictChange}
              disabled={!provinceCode || districts.length === 0}
              required
            >
              <option value="">-- Chọn Quận / Huyện --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Phường / Xã</label>
          <select
            className={styles.formSelect}
            value={wardCode || ''}
            onChange={handleWardChange}
            disabled={!districtCode || wards.length === 0}
            required
          >
            <option value="">-- Chọn Phường / Xã --</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Địa chỉ chi tiết (số nhà, tên đường...)</label>
          <input
            type="text"
            required
            className={styles.formInput}
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="Số 123 đường Lê Lợi, ngõ 4..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ghi chú giao hàng mặc định (tùy chọn)</label>
          <textarea
            rows={2}
            className={styles.formTextarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
          />
        </div>

        <button type="submit" className={styles.saveAddressBtn} disabled={saving}>
          <MapPinIcon size={16} />
          <span>{saving ? 'Đang lưu...' : 'Lưu địa chỉ mặc định'}</span>
        </button>
      </form>
    </div>
  );
}
