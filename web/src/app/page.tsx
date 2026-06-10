import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>✨ Your next great read awaits</span>
          <h1 className={styles.title}>
            Buy &amp; Sell Books
            <br />
            With Ease
          </h1>
          <p className={styles.subtitle}>
            Discover thousands of books from sellers near you. List your books
            in seconds and reach readers who&apos;ll love them.
          </p>
          <div className={styles.actions}>
            <Link href="/register">
              <Button size="lg">Start Selling</Button>
            </Link>
            <Link href="/books">
              <Button variant="secondary" size="lg">
                Browse Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>10K+</div>
          <div className={styles.statLabel}>Books Listed</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>5K+</div>
          <div className={styles.statLabel}>Active Sellers</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>98%</div>
          <div className={styles.statLabel}>Happy Buyers</div>
        </div>
      </section>
    </>
  );
}
