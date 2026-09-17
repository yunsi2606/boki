'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Action Buttons (FAB) */}
      <div className={styles.fabContainer}>
        <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className={`${styles.fabItem} ${styles.fabZalo}`} title="Chat Zalo">
          Zalo
        </a>
        <a href="https://m.me" target="_blank" rel="noopener noreferrer" className={`${styles.fabItem} ${styles.fabMessenger}`} title="Messenger">
          Messenger
        </a>
        <a href="https://shopee.vn" target="_blank" rel="noopener noreferrer" className={`${styles.fabItem} ${styles.fabShopee}`} title="Shopee Store">
          Shopee
        </a>
        <button onClick={scrollToTop} className={`${styles.fabItem} ${styles.fabTop}`} title="Về đầu trang">
          ↑
        </button>
      </div>

      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.grid}>
            {/* Column 1: Brand Info */}
            <div className={styles.brand}>
              <div className={styles.logoRow}>
                <div className={styles.logoIconBox}>
                  <img src="/brand/logo.png" alt="Boki Store Logo" className={styles.logoImg} />
                </div>
                <span className={styles.logoMain}>BOKI</span>
                <span className={styles.logoSub}>STORE</span>
              </div>
              <p className={styles.brandDesc}>
                Đại lý cung cấp sách & truyện bản quyền uy tín hàng đầu. Chuyên phân phối các đầu sách Manga, Light Novel, Văn học và Kỹ năng chính hãng.
              </p>
              <div className={styles.contactInfo}>
                <p>📍 <strong>Địa chỉ:</strong> Hà Nội / TP. Hồ Chí Minh</p>
                <p>📞 <strong>Hotline:</strong> 1900 6868 (8:00 - 21:00)</p>
                <p>✉️ <strong>Email:</strong> hotro@bokistore.vn</p>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className={styles.column}>
              <h4>Danh mục nổi bật</h4>
              <Link href="/books?category=light-novel">Light Novel Bản Đặc Biệt</Link>
              <Link href="/books?category=manga">Manga - Comic Mới Nhất</Link>
              <Link href="/books?category=van-hoc">Sách Văn Học Thế Giới</Link>
              <Link href="/books?category=ky-nang">Sách Kỹ Năng & Kinh Doanh</Link>
              <Link href="/#vouchers">Mã Khuyến Mãi Đồng Giá</Link>
            </div>

            {/* Column 3: Policy & Support */}
            <div className={styles.column}>
              <h4>Hỗ trợ khách hàng</h4>
              <Link href="/help">Hướng dẫn mua hàng</Link>
              <Link href="/shipping">Chính sách vận chuyển & Giao hàng</Link>
              <Link href="/returns">Chính sách đổi trả 100%</Link>
              <Link href="/terms">Điều khoản dịch vụ</Link>
              <Link href="/privacy">Bảo mật thông tin cá nhân</Link>
            </div>

            {/* Column 4: Partners & Payment */}
            <div className={styles.column}>
              <h4>Thanh toán & Đối tác</h4>
              <p className={styles.partnerText}>Hỗ trợ đa dạng phương thức thanh toán an toàn, tiện lợi:</p>
              <div className={styles.paymentBadges}>
                <span className={styles.paymentBadge}>MOMO</span>
                <span className={styles.paymentBadge}>VNPAY</span>
                <span className={styles.paymentBadge}>VISA</span>
                <span className={styles.paymentBadge}>COD</span>
              </div>
              <h4 style={{ marginTop: '20px' }}>Đối tác Nhà xuất bản</h4>
              <p className={styles.partnerText}>AZ Việt Nam, Amak, Kiseki, Cẩm Phong, Waka, Kim Đồng, Nhã Nam</p>
            </div>
          </div>

          <div className={styles.bottom}>
            <span className={styles.copyright}>
              &copy; {currentYear} BokiStore. Bản quyền thuộc về Boki Marketplace.
            </span>
            <div className={styles.socialLinks}>
              <span>Kết nối với chúng tôi:</span>
              <a href="#" className={styles.socialIcon}>Facebook</a>
              <a href="#" className={styles.socialIcon}>TikTok</a>
              <a href="#" className={styles.socialIcon}>YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

