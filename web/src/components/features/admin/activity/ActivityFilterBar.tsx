import React from 'react';
import type { ActivityFilterParams } from '@/types/activity';
import styles from './adminActivity.module.css';

interface ActivityFilterBarProps {
  filters: ActivityFilterParams;
  onFilterChange: (updated: Partial<ActivityFilterParams>) => void;
  onReset: () => void;
}

export default function ActivityFilterBar({
  filters,
  onFilterChange,
  onReset,
}: ActivityFilterBarProps) {
  return (
    <div className={styles.filterBar}>
      <input
        type="text"
        placeholder="Tìm theo đường dẫn, tên sách, email, IP hoặc session..."
        value={filters.search || ''}
        onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
        className={styles.filterInput}
      />

      <select
        value={filters.eventType || 'ALL'}
        onChange={(e) => onFilterChange({ eventType: e.target.value, page: 0 })}
        className={styles.filterSelect}
      >
        <option value="ALL">Tất cả Loại Sự Kiện</option>
        <option value="PAGE_VIEW">Xem Trang (PAGE_VIEW)</option>
        <option value="VIEW_BOOK">Xem Sách (VIEW_BOOK)</option>
        <option value="SEARCH">Tìm Kiếm (SEARCH)</option>
        <option value="ADD_TO_CART">Thêm Giỏ Hàng (ADD_TO_CART)</option>
        <option value="REMOVE_FROM_CART">Xóa Giỏ Hàng (REMOVE_FROM_CART)</option>
        <option value="INITIATE_CHECKOUT">Bắt Đầu Thanh Toán (INITIATE_CHECKOUT)</option>
        <option value="APPLY_VOUCHER">Áp Dụng Voucher (APPLY_VOUCHER)</option>
        <option value="PLACE_ORDER">Đặt Hàng Thành Công (PLACE_ORDER)</option>
        <option value="LOGIN">Đăng Nhập (LOGIN)</option>
        <option value="ADMIN_ACTION">Hành Động Admin (ADMIN_ACTION)</option>
      </select>

      <select
        value={filters.eventCategory || 'ALL'}
        onChange={(e) => onFilterChange({ eventCategory: e.target.value, page: 0 })}
        className={styles.filterSelect}
      >
        <option value="ALL">Tất cả Nhóm (Category)</option>
        <option value="NAVIGATION">Điều hướng (NAVIGATION)</option>
        <option value="ENGAGEMENT">Tương tác (ENGAGEMENT)</option>
        <option value="ECOMMERCE">Thương mại (ECOMMERCE)</option>
        <option value="AUTH">Xác thực (AUTH)</option>
        <option value="ADMIN">Quản trị (ADMIN)</option>
      </select>

      <button type="button" onClick={onReset} className={styles.resetBtn}>
        Đặt lại bộ lọc
      </button>
    </div>
  );
}
