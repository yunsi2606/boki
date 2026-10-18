'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './scheduleHeader.module.css';

export function ScheduleHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, loginUrl, redirectToLogin } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';
  const isSchedule = pathname.startsWith('/lich-phat-hanh');
  const isSeries = pathname.startsWith('/bo-truyen');
  const isVault = pathname.startsWith('/tu-sach');
  const isChangelog = pathname.startsWith('/lich-su-thay-doi');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/lich-phat-hanh?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left Section: Boki Logo & Navigation Links */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIconBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="Boki Logo" className={styles.logoImg} />
            </div>
            <div className={styles.logoBrand}>
              <span className={styles.logoMain}>BOKI</span>
              <span className={styles.logoSub}>LỊCH PHÁT HÀNH</span>
            </div>
          </Link>

          <nav className={styles.nav}>
            <Link href="/" className={`${styles.navLink} ${isHome ? styles.navLinkActive : ''}`}>
              Trang chủ
            </Link>
            <Link href="/lich-phat-hanh" className={`${styles.navLink} ${isSchedule ? styles.navLinkActive : ''}`}>
              Lịch phát hành
            </Link>
            <Link href="/bo-truyen" className={`${styles.navLink} ${isSeries ? styles.navLinkActive : ''}`}>
              Tác phẩm
            </Link>
            <Link href="/tu-sach" className={`${styles.navLink} ${isVault ? styles.navLinkActive : ''}`}>
              Tủ sách
            </Link>
            <Link href="/lich-su-thay-doi" className={`${styles.navLink} ${isChangelog ? styles.navLinkActive : ''}`}>
              Lịch sử thay đổi
            </Link>
          </nav>
        </div>

        {/* Right Section: Schedule Search Bar, Auth & Store Link */}
        <div className={styles.rightSection}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm lịch phát hành..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className={styles.searchInput}
            />
          </form>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className={styles.userMenuContainer} ref={dropdownRef}>
              <button
                type="button"
                className={styles.userTriggerBtn}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <div className={styles.avatarCircle}>
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.displayName} className={styles.avatarImg} />
                  ) : (
                    <span>{user.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <span className={styles.userName}>{user.displayName?.split(' ')[0] || 'Tài khoản'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{user.displayName}</div>
                    <div className={styles.dropdownEmail}>{user.email}</div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <a href={`${storeUrl}/profile`} target="_blank" rel="noopener noreferrer" className={styles.dropdownItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Tài khoản Boki Store</span>
                  </a>
                  <a href={`${storeUrl}/orders/history`} target="_blank" rel="noopener noreferrer" className={styles.dropdownItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    <span>Đơn hàng đã mua</span>
                  </a>
                  <div className={styles.dropdownDivider} />
                  <button type="button" onClick={logout} className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href={loginUrl}
              onClick={(e) => {
                if (typeof window !== 'undefined') {
                  e.preventDefault();
                  redirectToLogin(window.location.href);
                }
              }}
              className={styles.loginBtn}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>Đăng nhập</span>
            </a>
          )}

          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bokiStoreBtn}
          >
            <span>Boki Store</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
