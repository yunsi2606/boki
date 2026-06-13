'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
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
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/books');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Row 1: Logo, Navigation, User Utilities */}
        <div className={styles.topRow}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMain}>BOKI</span>
            <span className={styles.logoSub}>SHOP</span>
          </Link>

          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLinkActive}>Trang chủ</Link>
            <Link href="/books" className={styles.navLink}>Cửa hàng</Link>
            {isAuthenticated && (
              <Link href="/orders/history" className={styles.navLink}>Lịch sử mua</Link>
            )}
            <Link href="/#vouchers" className={styles.navLink}>Mã khuyến mại</Link>
          </nav>

          <div className={styles.userSection}>
            {/* Shopping Cart */}
            <Link href="/cart" className={styles.iconButton} aria-label="Giỏ hàng" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>

            {/* Notification Bell */}
            <button className={styles.iconButton} aria-label="Thông báo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>

            {/* Avatar / Login Info */}
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

        {/* Row 2: Categories Trigger, Search input, Seller Link */}
        <div className={styles.bottomRow}>
          <button onClick={() => router.push('/books')} className={styles.categoryMenuTrigger} aria-label="Danh mục">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="6" height="6" rx="1"></rect>
              <rect x="15" y="3" width="6" height="6" rx="1"></rect>
              <rect x="15" y="15" width="6" height="6" rx="1"></rect>
              <rect x="3" y="15" width="6" height="6" rx="1"></rect>
            </svg>
          </button>

          <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
            <div className={styles.searchInputWrapper}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Nhập tên sản phẩm, tên thương hiệu, tên thể loại..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.searchSubmit}>
              Tìm kiếm
            </button>
          </form>

          <Link href="/books/new" className={styles.sellerCta}>
            Đăng bán sách
            <svg className={styles.sellerArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
