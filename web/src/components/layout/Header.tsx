'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import { activityTracker } from '@/services/activityTracker';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      activityTracker.trackSearch(searchQuery.trim());
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/books');
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.announcementContent}>
          <span>✨ <strong>Ưu đãi tháng 9:</strong> Giảm tới 50% toàn bộ Manga & Light Novel | Nhập mã <strong>BOKI20K</strong> giảm ngay 20.000đ</span>
          <Link href="/#vouchers" className={styles.announcementLink}>Xem mã ngay &rarr;</Link>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.container}>
          {/* Row 1: Logo, Navigation Links, Cart & Auth */}
          <div className={styles.topRow}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIconBox}>
                <img src="/brand/logo.png" alt="Boki Store Logo" className={styles.logoImg} />
              </div>
              <span className={styles.logoMain}>BOKI</span>
              <span className={styles.logoSub}>STORE</span>
            </Link>

            <nav className={styles.navLinks}>
              <Link href="/" className={styles.navLinkActive}>Trang chủ</Link>
              <Link href="/books" className={styles.navLink}>Cửa hàng</Link>
              <Link href="/#vouchers" className={styles.navLink}>Mã giảm giá</Link>
              {isAuthenticated && (
                <Link href="/orders/history" className={styles.navLink}>Đơn hàng của tôi</Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className={styles.adminPortalBtn}>
                  Trang Admin
                </Link>
              )}
            </nav>

            <div className={styles.userSection}>
              {/* Wishlist Button */}
              <button className={styles.iconButton} aria-label="Yêu thích">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span className={styles.iconBadge}>0</span>
              </button>

              {/* Shopping Cart Button */}
              <Link href="/cart" className={styles.iconButton} aria-label="Giỏ hàng">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </Link>

              {/* User Account / Auth Buttons */}
              {isAuthenticated ? (
                <div className={styles.userMenu}>
                  <div className={styles.avatarRing}>
                    <div className={styles.avatar}>
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName || 'User'} className={styles.avatarImg} />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={logout} className={styles.logoutBtn}>
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/login" className={styles.loginLink}>
                    Đăng nhập
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Đăng ký</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Category Trigger + Search Bar */}
          <div className={styles.bottomRow}>
            <button onClick={() => router.push('/books')} className={styles.categoryMenuTrigger}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
              <span>Danh mục sách</span>
            </button>

            <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
              <div className={styles.searchInputWrapper}>
                <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm sách, tác giả, NXB, thể loại..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.searchSubmit}>
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>
      </header>
    </>
  );
}

