import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <span className={styles.logo}>Boki</span>
            <p className={styles.brandDesc}>
              The modern book marketplace. Buy and sell books with ease.
            </p>
          </div>

          <div className={styles.column}>
            <h4>Marketplace</h4>
            <Link href="/books">Browse Books</Link>
            <Link href="/sell">Sell a Book</Link>
            <Link href="/categories">Categories</Link>
          </div>

          <div className={styles.column}>
            <h4>Account</h4>
            <Link href="/login">Log In</Link>
            <Link href="/register">Sign Up</Link>
            <Link href="/profile">My Profile</Link>
          </div>

          <div className={styles.column}>
            <h4>Support</h4>
            <Link href="/help">Help Center</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            &copy; {currentYear} Boki. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
