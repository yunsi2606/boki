'use client';

import React, { useEffect, useState } from 'react';
import { voucherService } from '@/services/voucherService';
import type { Voucher, VoucherDiscountType, VoucherType, UserScope } from '@/types/voucher';
import styles from './adminVouchers.module.css';

import { VoucherGridSkeleton } from '@/components/ui/Skeleton';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'product' | 'shipping'>('all');

  // Rich Conditions Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    type: 'PRODUCT' as VoucherType,
    discountType: 'FIXED_AMOUNT' as VoucherDiscountType,
    tag: '🎟️ GIẢM GIÁ SẢN PHẨM',
    discountValue: 20000,
    maxDiscountAmount: 50000,
    minOrderValue: 150000,
    usageLimit: 500,
    userUsageLimit: 1,
    applicableCategoryId: 0,
    userScope: 'ALL' as UserScope,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    isActive: true,
  });

  useEffect(() => {
    async function loadVouchers() {
      try {
        const data = await voucherService.getAdminVouchers();
        setVouchers(data || []);
      } catch (err) {
        console.error('Failed to load admin vouchers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVouchers();
  }, []);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) {
      alert('Vui lòng nhập Mã voucher và Tiêu đề!');
      return;
    }

    try {
      const payload: Omit<Voucher, 'id' | 'usedCount'> = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        discountType: formData.discountType,
        tag: formData.tag,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.discountType === 'PERCENTAGE' ? Number(formData.maxDiscountAmount) : undefined,
        minOrderValue: Number(formData.minOrderValue),
        usageLimit: Number(formData.usageLimit),
        userUsageLimit: Number(formData.userUsageLimit),
        applicableCategoryId: formData.applicableCategoryId > 0 ? formData.applicableCategoryId : undefined,
        userScope: formData.userScope,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00Z` : undefined,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : undefined,
        isActive: formData.isActive,
      };

      const newVoucher = await voucherService.createVoucher(payload);
      setVouchers([newVoucher, ...vouchers]);
      setIsModalOpen(false);

      // Reset form
      setFormData({
        code: '',
        title: '',
        description: '',
        type: 'PRODUCT',
        discountType: 'FIXED_AMOUNT',
        tag: '🎟️ GIẢM GIÁ SẢN PHẨM',
        discountValue: 20000,
        maxDiscountAmount: 50000,
        minOrderValue: 150000,
        usageLimit: 500,
        userUsageLimit: 1,
        applicableCategoryId: 0,
        userScope: 'ALL',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-12-31',
        isActive: true,
      });
    } catch (err) {
      alert('Tạo mã voucher thất bại!');
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
      await voucherService.deleteVoucher(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Filter vouchers list
  const filteredVouchers = vouchers.filter((v) => {
    if (activeFilter === 'active') return v.isActive;
    if (activeFilter === 'product') return v.type === 'PRODUCT';
    if (activeFilter === 'shipping') return v.type === 'SHIPPING';
    return true;
  });

  const totalActive = vouchers.filter((v) => v.isActive).length;
  const totalUsed = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản Lý Mã Giảm Giá (Vouchers)</h1>
          <p className={styles.pageSubtitle}>
            Thiết lập điều kiện áp dụng & theo dõi hiệu suất các chương trình khuyến mãi
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className={styles.primaryBtn}>
          + Tạo Voucher Với Nhanh Điều Kiện
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎟️</div>
          <div>
            <h3 className={styles.statVal}>{vouchers.length}</h3>
            <p className={styles.statLabel}>Tổng số Mã Voucher</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            🟢
          </div>
          <div>
            <h3 className={styles.statVal}>{totalActive}</h3>
            <p className={styles.statLabel}>Đang Kích Hoạt</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            📊
          </div>
          <div>
            <h3 className={styles.statVal}>{totalUsed}</h3>
            <p className={styles.statLabel}>Tổng Lượt Đã Sử Dụng</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Tất cả ({vouchers.length})
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'active' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveFilter('active')}
        >
          Đang kích hoạt ({totalActive})
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'product' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveFilter('product')}
        >
          Giảm Giá Sản Phẩm
        </button>
        <button
          className={`${styles.filterBtn} ${activeFilter === 'shipping' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveFilter('shipping')}
        >
          Miễn Phí Vận Chuyển
        </button>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <VoucherGridSkeleton count={4} />
      ) : filteredVouchers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary, #64748b)', background: 'white', borderRadius: '12px' }}>
          Chưa có voucher nào. Hãy bấm &quot;+ Tạo Mã Mới&quot; để thêm voucher.
        </div>
      ) : (
        <div className={styles.vouchersGrid}>
          {filteredVouchers.map((v) => {
            const limit = v.usageLimit || 1;
            const used = v.usedCount || 0;
            const progressPercent = Math.min(100, Math.round((used / limit) * 100));

            return (
              <div key={v.id} className={`${styles.voucherCard} ${!v.isActive ? styles.voucherInactive : ''}`}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.typeBadge} ${v.type === 'SHIPPING' ? styles.typeBadgeShipping : ''}`}>
                    {v.tag || (v.type === 'SHIPPING' ? 'FREESHIP' : 'GIẢM GIÁ')}
                  </span>
                  <span className={styles.codeBadge}>{v.code}</span>
                </div>

                <h3 className={styles.voucherTitle}>{v.title}</h3>
                <p className={styles.voucherDesc}>{v.description}</p>

                {/* Rich Conditions Badges */}
                <div className={styles.conditionsBadgeGroup}>
                  <span className={styles.condBadge}>
                    Đơn từ: {formatCurrency(v.minOrderValue)}
                  </span>
                  {v.discountType === 'PERCENTAGE' && (
                    <span className={styles.condBadge}>
                      Giảm: {v.discountValue}% {v.maxDiscountAmount ? `(Tối đa ${formatCurrency(v.maxDiscountAmount)})` : ''}
                    </span>
                  )}
                  {v.discountType === 'FIXED_AMOUNT' && (
                    <span className={styles.condBadge}>
                      Giảm: {formatCurrency(v.discountValue)}
                    </span>
                  )}
                  {v.userUsageLimit > 0 && (
                    <span className={styles.condBadge}>
                      👤 {v.userUsageLimit} lần/khách
                    </span>
                  )}
                  {v.applicableCategoryName && (
                    <span className={styles.condBadge}>
                      🏷️ Danh mục: {v.applicableCategoryName}
                    </span>
                  )}
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressText}>
                    <span>Đã sử dụng</span>
                    <span>
                      {used} / {limit} ({progressPercent}%)
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={v.isActive ? styles.statusActive : styles.statusDisabled}>
                    {v.isActive ? '● Đang kích hoạt' : '○ Tạm ngừng'}
                  </span>
                  <div className={styles.actionBtns}>
                    <button onClick={() => handleDeleteVoucher(v.id)} className={styles.deleteBtn}>
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rich Conditions Create Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Tạo Voucher & Thiết Lập Điều Kiện</h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className={styles.modalForm}>
              {/* Section 1: Basic Info */}
              <div className={styles.formSectionTitle}>📌 1. THÔNG TIN CƠ BẢN</div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Mã Voucher (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: BOKISALE50K"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Loại chương trình</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value as VoucherType;
                      setFormData({
                        ...formData,
                        type: newType,
                        discountType: newType === 'SHIPPING' ? 'FREE_SHIPPING' : 'FIXED_AMOUNT',
                        tag: newType === 'SHIPPING' ? '🚚 MIỄN PHÍ VẬN CHUYỂN' : '🎟️ GIẢM GIÁ SẢN PHẨM',
                      });
                    }}
                    className={styles.formSelect}
                  >
                    <option value="PRODUCT">Giảm Giá Sản Phẩm</option>
                    <option value="SHIPPING">Miễn Phí Vận Chuyển</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tiêu đề hiển thị</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Giảm 15% cho đơn tối thiểu 200.000đ"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả chi tiết thể lệ</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả điều kiện sử dụng mã..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={styles.formTextarea}
                />
              </div>

              {/* Section 2: Discount Rules */}
              <div className={styles.formSectionTitle}>💰 2. HÌNH THỨC GIẢM GIÁ</div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Kiểu giảm giá</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as VoucherDiscountType })}
                    className={styles.formSelect}
                  >
                    <option value="FIXED_AMOUNT">Giảm tiền cố định (VNĐ)</option>
                    <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
                    <option value="FREE_SHIPPING">Miễn phí vận chuyển (Freeship)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    {formData.discountType === 'PERCENTAGE' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              {formData.discountType === 'PERCENTAGE' && (
                <div className={styles.formGroup}>
                  <label>Mức giảm tối đa (Tối đa VNĐ)</label>
                  <input
                    type="number"
                    placeholder="VD: 50000"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseInt(e.target.value) || 0 })}
                    className={styles.formInput}
                  />
                </div>
              )}

              {/* Section 3: Rich Conditions */}
              <div className={styles.formSectionTitle}>⚙️ 3. ĐIỀU KIỆN ÁP DỤNG & GIỚI HẠN</div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tổng lượt dùng toàn hệ thống</label>
                  <input
                    type="number"
                    required
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 100 })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Giới hạn dùng / 1 Tài khoản</label>
                  <input
                    type="number"
                    required
                    value={formData.userUsageLimit}
                    onChange={(e) => setFormData({ ...formData, userUsageLimit: parseInt(e.target.value) || 1 })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Giới hạn Danh mục áp dụng</label>
                  <select
                    value={formData.applicableCategoryId}
                    onChange={(e) => setFormData({ ...formData, applicableCategoryId: parseInt(e.target.value) || 0 })}
                    className={styles.formSelect}
                  >
                    <option value={0}>Tất cả các danh mục</option>
                    <option value={1}>Sách Văn học</option>
                    <option value={2}>Sách Thiếu nhi</option>
                    <option value={3}>Manga - Comic</option>
                    <option value={4}>Light Novel</option>
                    <option value={5}>Kỹ năng sống</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" style={{ fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                  Kích hoạt mã voucher này ngay sau khi tạo
                </label>
              </div>

              {/* Actions */}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                  Hủy bỏ
                </button>
                <button type="submit" className={styles.saveBtn}>
                  💾 Lưu Mã Khuyến Mãi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
