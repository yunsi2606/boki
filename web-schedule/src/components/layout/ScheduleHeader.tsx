'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './scheduleHeader.module.css';

export function ScheduleHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');

  const isHome = pathname === '/';
  const isSchedule = pathname.startsWith('/lich-phat-hanh');
  const isSeries = pathname.startsWith('/bo-truyen');
  const isVault = pathname.startsWith('/tu-sach');
  const isChangelog = pathname.startsWith('/lich-su-thay-doi');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/lich-phat-hanh?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

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

        {/* Right Section: Schedule Search Bar & Store Link */}
        <div className={styles.rightSection}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm lịch phát hành, truyện..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className={styles.searchInput}
            />
          </form>

          <a
            href={process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bokiStoreBtn}
          >
            <span>Sàn Boki Store</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
