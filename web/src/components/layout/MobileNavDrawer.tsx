'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@/types';
import styles from './mobileNavDrawer.module.css';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  isRedirectToSchedule: boolean;
  scheduleUrl: string;
}

export default function MobileNavDrawer({
  isOpen,
  onClose,
  user,
  isAuthenticated,
  onLogout,
  isRedirectToSchedule,
  scheduleUrl,
}: MobileNavDrawerProps) {
  const pathname = usePathname();

  const initials = (user?.displayName || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navLinks = [
    {
      label: 'Lịch phát hành',
      href: scheduleUrl,
      isExternal: true,
      active: pathname?.startsWith('/lich-phat-hanh') || pathname?.startsWith('/schedule'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Tủ sách của tôi',
      href: '/tu-sach',
      active: pathname?.startsWith('/tu-sach'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      label: 'Cửa hàng sách',
      href: '/books',
      active: pathname?.startsWith('/books'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: 'Đọc thử miễn phí',
      href: '/preview',
      active: pathname?.startsWith('/preview'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      label: 'Bài viết & Tin tức',
      href: '/blog',
      active: pathname?.startsWith('/blog'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`} aria-label="Menu di động">
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.logoBox} onClick={onClose}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Boki" className={styles.logoImg} />
            <span className={styles.logoText}>BOKI STORE</span>
          </Link>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.sectionTitle}>Khám phá Boki</div>
          {!isRedirectToSchedule && (
            <Link
              href="/"
              className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`}
              onClick={onClose}
            >
              <span className={styles.navIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span>Trang chủ</span>
            </Link>
          )}

          {navLinks.map((item) =>
            item.isExternal ? (
              <a
                key={item.label}
                href={item.href}
                className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
                onClick={onClose}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
                onClick={onClose}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          )}

          {user?.role === 'ADMIN' && (
            <Link href="/admin" className={`${styles.navItem} ${styles.adminItem}`} onClick={onClose}>
              <span className={styles.navIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <span>Quản trị hệ thống (Admin)</span>
            </Link>
          )}
        </div>

        <div className={styles.drawerFooter}>
          {isAuthenticated && user ? (
            <>
              <div className={styles.userProfileBox}>
                <div className={styles.avatarBox}>
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.displayName} className={styles.avatarImg} />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.displayName || 'Khách hàng Boki'}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <div className={styles.authGroup}>
              <Link href="/login" className={styles.loginBtn} onClick={onClose}>
                Đăng nhập
              </Link>
              <Link href="/register" className={styles.registerBtn} onClick={onClose}>
                Đăng ký tài khoản
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
