'use client';

import React from 'react';
import type { UserFilterState } from '@/types/adminUser';
import styles from './userFilterBar.module.css';

interface UserFilterBarProps {
  filter: UserFilterState;
  onFilterChange: (newFilter: UserFilterState) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  filter,
  onFilterChange,
  onRefresh,
  loading,
}) => {
  const handleChange = (field: keyof UserFilterState, value: string) => {
    onFilterChange({ ...filter, [field]: value });
  };

  const handleReset = () => {
    onFilterChange({
      keyword: '',
      active: 'ALL',
      phoneVerified: 'ALL',
      memberTier: 'ALL',
    });
  };

  const hasFilterActive =
    filter.keyword ||
    filter.active !== 'ALL' ||
    filter.phoneVerified !== 'ALL' ||
    filter.memberTier !== 'ALL';

  return (
    <div className={styles.filterBar}>
      <div className={styles.searchBox}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
          value={filter.keyword}
          onChange={(e) => handleChange('keyword', e.target.value)}
          className={styles.searchInput}
        />
        {filter.keyword && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => handleChange('keyword', '')}
            aria-label="Xóa từ khóa"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.filterControls}>
        <select
          value={filter.active}
          onChange={(e) => handleChange('active', e.target.value)}
          className={styles.selectFilter}
          aria-label="Lọc theo trạng thái hoạt động"
        >
          <option value="ALL">Mọi trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="BLOCKED">Đã bị khóa</option>
        </select>

        <select
          value={filter.phoneVerified}
          onChange={(e) => handleChange('phoneVerified', e.target.value)}
          className={styles.selectFilter}
          aria-label="Lọc theo xác thực số điện thoại"
        >
          <option value="ALL">Mọi trạng thái SĐT</option>
          <option value="VERIFIED">Đã xác thực SĐT</option>
          <option value="UNVERIFIED">Chưa xác thực SĐT</option>
        </select>

        <select
          value={filter.memberTier}
          onChange={(e) => handleChange('memberTier', e.target.value)}
          className={styles.selectFilter}
          aria-label="Lọc theo hạng thành viên"
        >
          <option value="ALL">Mọi hạng thành viên</option>
          <option value="STANDARD">Standard</option>
          <option value="SILVER">Silver</option>
          <option value="GOLD">Gold</option>
          <option value="DIAMOND">Diamond</option>
        </select>

        {hasFilterActive && (
          <button
            type="button"
            onClick={handleReset}
            className={styles.resetFilterBtn}
          >
            Đặt lại bộ lọc
          </button>
        )}

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className={styles.refreshBtn}
          title="Tải lại dữ liệu"
        >
          <svg className={loading ? styles.spinning : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
};
