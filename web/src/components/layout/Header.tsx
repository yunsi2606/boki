'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useStoreConfig } from '@/contexts/StoreConfigContext';
import Button from '@/components/ui/Button';
import SmartSearchBar from '@/components/features/search/SmartSearchBar';
import UserAvatarDropdown from './UserAvatarDropdown';
import MobileNavDrawer from './MobileNavDrawer';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { isRedirectToSchedule, scheduleUrl } = useStoreConfig();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const logoContent = (
    <>
      <div className={styles.logoIconBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="Boki Store Logo" className={styles.logoImg} />
      </div>
      <span className={styles.logoMain}>BOKI</span>
      <span className={styles.logoSub}>STORE</span>
    </>
  );

  return (
    <>
      {/* Top Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.announcementContent}>
          <span><strong>Ưu đãi:</strong> Giảm tới 50% Manga & Light Novel | Nhập mã <strong>BOKI20K</strong></span>
          {!isRedirectToSchedule && (
            <Link href="/#vouchers" className={styles.announcementLink}>Xem mã ngay</Link>
          )}
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.container}>
          {/* Row 1: Mobile Hamburger, Logo, Nav Links & User Section */}
          <div className={styles.topRow}>
            <div className={styles.leftGroup}>
              <button
                type="button"
                className={styles.mobileMenuBtn}
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Mở menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {isRedirectToSchedule ? (
                <a href={scheduleUrl} className={styles.logo} title="Trang Lịch phát hành">
                  {logoContent}
                </a>
              ) : (
                <Link href="/" className={styles.logo}>
                  {logoContent}
                </Link>
              )}
            </div>

            <nav className={styles.navLinks}>
              {!isRedirectToSchedule && (
                <Link href="/" className={pathname === '/' ? styles.navLinkActive : styles.navLink}>Trang chủ</Link>
              )}
              <Link href="/books" className={pathname?.startsWith('/books') ? styles.navLinkActive : styles.navLink}>Cửa hàng</Link>
              <a href={scheduleUrl} className={styles.navLink}>Lịch phát hành</a>
              <Link href="/tu-sach" className={pathname?.startsWith('/tu-sach') ? styles.navLinkActive : styles.navLink}>Tủ sách</Link>
              <Link href="/preview" className={pathname?.startsWith('/preview') ? styles.navLinkActive : styles.navLink}>Đọc thử</Link>
              <Link href="/blog" className={pathname?.startsWith('/blog') ? styles.navLinkActive : styles.navLink}>Bài viết</Link>
              {!isRedirectToSchedule && (
                <Link href="/#vouchers" className={styles.navLink}>Mã giảm giá</Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className={styles.adminPortalBtn}>
                  Trang Admin
                </Link>
              )}
            </nav>

            <div className={styles.userSection}>
              {/* Wishlist Button (Desktop only) */}
              <button className={`${styles.iconButton} ${styles.desktopOnly}`} aria-label="Yêu thích">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className={styles.iconBadge}>0</span>
              </button>

              {/* Shopping Cart Button */}
              <Link href="/cart" className={styles.iconButton} aria-label="Giỏ hàng">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </Link>

              {/* User Account / Auth */}
              {isAuthenticated ? (
                <UserAvatarDropdown user={user} onLogout={logout} />
              ) : (
                <>
                  <div className={styles.authButtons}>
                    <Link href="/login" className={styles.loginLink}>Đăng nhập</Link>
                    <Link href="/register"><Button size="sm">Đăng ký</Button></Link>
                  </div>
                  <Link href="/login" className={`${styles.iconButton} ${styles.mobileUserBtn}`} aria-label="Đăng nhập">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Category Trigger + Search Bar */}
          <div className={styles.bottomRow}>
            <button type="button" onClick={() => router.push('/books')} className={styles.categoryMenuTrigger}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span>Danh mục sách</span>
            </button>
            <div className={styles.searchWrap}>
              <SmartSearchBar />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        isRedirectToSchedule={isRedirectToSchedule}
        scheduleUrl={scheduleUrl}
      />
    </>
  );
}
