'use client';

import Link from 'next/link';
import styles from './homeVaultCta.module.css';

export function HomeVaultCta() {
  return (
    <section className={styles.ctaCard}>
      <div className={styles.leftCol}>
        <div className={styles.kicker}>TỦ SÁCH CÁ NHÂN</div>
        <h2 className={styles.title}>Quản Lý Bộ Sưu Tập Manga & Lịch Phát Hành</h2>
        <p className={styles.desc}>
          Đánh dấu những tập truyện bạn đã sở hữu, lưu lại các ấn bản đặc biệt đang mong chờ và nhận thông báo khi có lịch phát hành mới từ các nhà xuất bản.
        </p>
        <Link href="/tu-sach" className={styles.ctaBtn}>
          <span>Mở Tủ Sách Của Tôi</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>

      <div className={styles.rightCol}>
        <div className={styles.featureItem}>
          <div className={styles.iconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div>
            <div className={styles.featureTitle}>Theo dõi tiến độ theo tập</div>
            <div className={styles.featureDesc}>Biết chính xác bộ truyện bạn đã mua đến tập mấy.</div>
          </div>
        </div>

        <div className={styles.featureItem}>
          <div className={styles.iconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <div className={styles.featureTitle}>Nhắc ngày lên kệ</div>
            <div className={styles.featureDesc}>Không bỏ lỡ ấn bản đặc biệt và quà tặng giới hạn.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
