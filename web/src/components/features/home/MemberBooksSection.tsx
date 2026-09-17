'use client';

import Link from 'next/link';
import styles from './ProductShowcase.module.css';

export interface MemberBookItem {
  id: string;
  title: string;
  author: string;
  views: string;
  rating: number;
  price: string;
  cover: string;
  tag: string;
  badgeType?: string;
  badgeText?: string;
}

const mockDailyBooks: MemberBookItem[] = [
  {
    id: 'd1',
    title: 'CẢ NGÀY BẬN RỘN CẢ ĐỜI TRÌ HOÃN',
    author: 'Steve Chandler',
    views: '24K',
    rating: 4.8,
    price: '49.000đ',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Sách nói',
    badgeType: 'discount49',
    badgeText: '49.000đ ⚡',
  },
  {
    id: 'd2',
    title: 'QUY TẮC NHÌN THẤU BẢN CHẤT CỦA SỰ VẬT',
    author: 'Hoàng Nguyễn',
    views: '15.2K',
    rating: 4.9,
    price: '49.000đ',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Ebook',
    badgeType: 'discount49',
    badgeText: '49.000đ ⚡',
  },
  {
    id: 'd3',
    title: 'ĐỊNH VỊ BẢN THÂN NHƯ NGƯỜI XUẤT SẮC',
    author: 'Kha Học',
    views: '38K',
    rating: 5.0,
    price: 'Đọc ngay',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Sách nói',
    badgeType: 'vip',
    badgeText: 'HỘI VIÊN 👑',
  },
  {
    id: 'd4',
    title: 'Đêm Trắng Vĩnh Hằng Và Những Câu Chuyện Thần Thoại',
    author: 'Fyodor Dostoevsky',
    views: '45K',
    rating: 4.9,
    price: 'Đọc ngay',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Ebook',
    badgeType: 'vip',
    badgeText: 'HỘI VIÊN 👑',
  },
];

export default function MemberBooksSection() {
  return (
    <section className={styles.memberSection}>
      <div className="container">
        <div className={styles.productsHeader}>
          <div>
            <h2 className={styles.sectionTitle}>👑 Sách Mới Mỗi Ngày - Dành Cho Hội Viên</h2>
            <p style={{ fontSize: '14px', color: '#6C757D', marginTop: '4px' }}>
              Độc quyền trải nghiệm đọc thử trọn vẹn dành riêng cho thành viên VIP
            </p>
          </div>
          <Link href="/books" style={{ fontSize: '14px', fontWeight: 700, color: '#EE4D2D', textDecoration: 'none' }}>
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className={styles.bookGrid}>
          {mockDailyBooks.map((book) => (
            <div key={book.id} className={styles.bookCard}>
              <div className={styles.coverWrapper}>
                <img
                  src={book.cover}
                  alt={book.title}
                  className={styles.coverImage}
                  loading="lazy"
                />
                <span className={styles.cardTag}>{book.tag}</span>
                {book.badgeText && (
                  <span
                    className={`${styles.discountBadge} ${
                      book.badgeType === 'vip' ? styles.badgeVip : styles.badgeDiscount49
                    }`}
                  >
                    {book.badgeText}
                  </span>
                )}
              </div>
              <div className={styles.infoWrapper}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <p className={styles.bookAuthor}>{book.author}</p>
                <div className={styles.ratingWrapper}>
                  <span className={styles.starIcon}>★</span>
                  <span className={styles.ratingVal}>{book.rating}</span>
                  <span className={styles.dotDivider}>•</span>
                  <span className={styles.viewText}>{book.views} xem</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.bookPrice}>{book.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
