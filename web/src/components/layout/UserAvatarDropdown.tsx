'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@/types';
import {
  UserIcon,
  PackageIcon,
  TicketIcon,
  ShieldCheckIcon,
  LogOutIcon,
  CrownIcon,
} from '@/components/ui/LineIcons';
import styles from './UserAvatarDropdown.module.css';

interface UserAvatarDropdownProps {
  user: User | null;
  onLogout: () => void;
}

export default function UserAvatarDropdown({ user, onLogout }: UserAvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const tier = (user?.memberTier || 'STANDARD').toUpperCase();

  const getTierDisplayName = (t: string) => {
    switch (t) {
      case 'SILVER':
        return 'Thành Viên Bạc (-3%)';
      case 'GOLD':
        return 'Thành Viên Vàng (-5%)';
      case 'PLATINUM':
        return 'Bạch Kim VIP (-10%)';
      case 'DIAMOND':
        return 'Kim Cương VVIP (-15%)';
      default:
        return 'Thành Viên Tiêu Chuẩn';
    }
  };

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button
        className={styles.triggerBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Tài khoản cá nhân"
      >
        <div className={`${styles.avatarRing} ${styles[`tier_${tier}`] || styles.tier_STANDARD}`}>
          <div className={styles.avatar}>
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.displayName || 'User'} className={styles.avatarImg} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </div>

        <svg
          className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {/* User Info Header */}
          <div className={styles.userHeader}>
            <h4 className={styles.userName}>{user?.displayName || 'Khách hàng Boki'}</h4>
            <p className={styles.userEmail}>{user?.email}</p>

            <div className={`${styles.tierBadge} ${styles[`badge_${tier}`] || styles.badge_STANDARD}`}>
              <CrownIcon size={14} />
              <span>{getTierDisplayName(tier)}</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className={styles.metricsRow}>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Điểm tích lũy</span>
              <span className={styles.metricValue}>{user?.loyaltyPoints || 0} xu</span>
            </div>
            <div className={styles.metricItem} style={{ alignItems: 'flex-end' }}>
              <span className={styles.metricLabel}>Cấp bậc</span>
              <span className={styles.metricValue}>{tier}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className={styles.menuList}>
            <Link href="/profile" className={styles.menuItem} onClick={handleItemClick}>
              <span className={styles.menuItemIcon}>
                <UserIcon size={18} />
              </span>
              <span>Trang cá nhân & Xếp hạng</span>
            </Link>

            <Link href="/orders/history" className={styles.menuItem} onClick={handleItemClick}>
              <span className={styles.menuItemIcon}>
                <PackageIcon size={18} />
              </span>
              <span>Đơn hàng của tôi</span>
            </Link>

            <Link href="/#vouchers" className={styles.menuItem} onClick={handleItemClick}>
              <span className={styles.menuItemIcon}>
                <TicketIcon size={18} />
              </span>
              <span>Kho mã giảm giá</span>
            </Link>

            {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
              <Link href="/admin" className={styles.menuItem} onClick={handleItemClick}>
                <span className={styles.menuItemIcon}>
                  <ShieldCheckIcon size={18} />
                </span>
                <span>Quản trị hệ thống</span>
              </Link>
            )}

            <div className={styles.divider} />

            <button
              className={`${styles.menuItem} ${styles.logoutItem}`}
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
            >
              <span className={styles.menuItemIcon}>
                <LogOutIcon size={18} />
              </span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
