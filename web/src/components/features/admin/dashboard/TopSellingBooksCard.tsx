'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, BookOpen } from 'lucide-react';
import type { TopSellingBook } from '@/types/adminAnalytics';
import styles from './topSellingBooksCard.module.css';

interface TopSellingBooksCardProps {
  books: TopSellingBook[];
  isLoading?: boolean;
}

export default function TopSellingBooksCard({
  books,
  isLoading,
}: TopSellingBooksCardProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return styles.rank1;
    if (rank === 2) return styles.rank2;
    if (rank === 3) return styles.rank3;
    return styles.rankOther;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconBadge}>
          <Trophy size={18} />
        </div>
        <div>
          <h3 className={styles.title}>Top Sách Bán Chạy</h3>
          <p className={styles.subtitle}>Sản phẩm đóng góp doanh số và số lượng bán tốt nhất</p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingBox}>Đang tải danh sách bán chạy...</div>
      ) : books.length === 0 ? (
        <div className={styles.emptyBox}>Chưa có phát sinh số liệu bán hàng</div>
      ) : (
        <div className={styles.bookList}>
          {books.map((book, idx) => {
            const rank = idx + 1;
            return (
              <div key={book.bookId} className={styles.bookItem}>
                <div className={`${styles.rankBadge} ${getRankClass(rank)}`}>
                  {rank}
                </div>

                <div className={styles.coverBox}>
                  {book.coverUrl && !imgErrors[book.bookId] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className={styles.coverImg}
                      onError={() => setImgErrors((prev) => ({ ...prev, [book.bookId]: true }))}
                    />
                  ) : (
                    <div className={styles.coverFallback}>
                      <BookOpen size={18} />
                    </div>
                  )}
                </div>

                <div className={styles.bookInfo}>
                  <Link
                    href={`/books/${book.bookId}`}
                    className={styles.bookTitle}
                    title={book.title}
                  >
                    {book.title}
                  </Link>
                  <span className={styles.bookAuthor} title={book.author}>
                    {book.author || 'Đang cập nhật tác giả'}
                  </span>
                </div>

                <div className={styles.bookStats}>
                  <span className={styles.soldBadge}>
                    Đã bán {book.unitsSold}
                  </span>
                  <span className={styles.revenueText}>
                    {formatCurrency(book.revenue)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
