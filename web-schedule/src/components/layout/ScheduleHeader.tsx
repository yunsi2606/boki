'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './scheduleHeader.module.css';

export function ScheduleHeader() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isSchedule = pathname.startsWith('/lich-phat-hanh');
  const isSeries = pathname.startsWith('/bo-truyen');
  const isVault = pathname.startsWith('/tu-sach');
  const isChangelog = pathname.startsWith('/lich-su-thay-doi');

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoBadge}>BOKI</div>
            <div>
              <div className={styles.logoTitle}>Lịch Phát Hành</div>
              <div className={styles.logoSubtitle}>Manga & Light Novel</div>
            </div>
          </Link>

          <nav className={styles.nav}>
            <Link href="/" className={`${styles.navLink} ${isHome ? styles.navLinkActive : ''}`}>
              Trang chủ
            </Link>
            <Link
              href="/lich-phat-hanh"
              className={`${styles.navLink} ${isSchedule ? styles.navLinkActive : ''}`}
            >
              Lịch phát hành
            </Link>
            <Link
              href="/bo-truyen"
              className={`${styles.navLink} ${isSeries ? styles.navLinkActive : ''}`}
            >
              Tác phẩm
            </Link>
            <Link
              href="/tu-sach"
              className={`${styles.navLink} ${isVault ? styles.navLinkActive : ''}`}
            >
              Tủ sách
            </Link>
            <Link
              href="/lich-su-thay-doi"
              className={`${styles.navLink} ${isChangelog ? styles.navLinkActive : ''}`}
            >
              Lịch sử thay đổi
            </Link>
          </nav>
        </div>

        <div className={styles.rightSection}>
          <a
            href={process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bokiStoreBtn}
          >
            <span>Sàn Boki Store</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
