'use client';

import Link from 'next/link';
import styles from './homeReaderReviews.module.css';

interface ReviewItem {
  id: string;
  reviewerName: string;
  avatarColor: string;
  verified: boolean;
  rating: number;
  bookTitle: string;
  bookSlug: string;
  comment: string;
  timeAgo: string;
}

const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    reviewerName: 'Minh Quân',
    avatarColor: '#EE4D2D',
    verified: true,
    rating: 5,
    bookTitle: 'Chung một mái nhà - Tập 7 (Light Novel)',
    bookSlug: 'chung-mot-mai-nha-tap-7',
    comment:
      'Bản giới hạn kèm set 2 bookmark bế hình và card trái tim in cực nét! Bìa sách cán màng mờ cầm rất êm tay, bản dịch của Wings Books mượt mà đúng phong cách hài hước đời thường.',
    timeAgo: '1 ngày trước',
  },
  {
    id: 'rev-2',
    reviewerName: 'Thu Hà',
    avatarColor: '#FF9800',
    verified: true,
    rating: 5,
    bookTitle: 'Ao Ashi - Tân binh sân cỏ - Tập 7',
    bookSlug: 'ao-ashi-tan-binh-san-co-tap-7',
    comment:
      'Tập này trận đấu đỉnh cao kịch tính. Kim Đồng in giấy xốp nhẹ, mở phẳng đọc không lo cấn gáy. Quà tặng kèm bookmark chuẩn xịn cho fan bóng đá chân chính.',
    timeAgo: '2 ngày trước',
  },
  {
    id: 'rev-3',
    reviewerName: 'Hoàng Long',
    avatarColor: '#2B8A3E',
    verified: true,
    rating: 5,
    bookTitle: 'Sakamoto Days - Tập 25',
    bookSlug: 'sakamoto-days-tap-25',
    comment:
      'Pha hành động vẽ mãn nhãn từng khung hình! Chất lượng mực in đậm nét, không bị lem trang sau. Lên lịch giao đúng ngày phát hành, đóng gói bọc xốp chống sốc rất an tâm.',
    timeAgo: '3 ngày trước',
  },
];

export function HomeReaderReviews() {
  return (
    <section className={styles.sectionContainer} aria-label="Bình luận người mua">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.kicker}>CẢM NHẬN & ĐÁNH GIÁ</span>
          <h2 className={styles.sectionTitle}>Cộng Đồng Độc Giả Nói Gì</h2>
          <p className={styles.sectionSubtitle}>
            Chia sẻ chân thực từ độc giả đã sở hữu các ấn bản truyện tranh & light novel mới
          </p>
        </div>
      </div>

      <div className={styles.reviewsGrid}>
        {SAMPLE_REVIEWS.map((rev) => (
          <div key={rev.id} className={styles.reviewCard}>
            <div className={styles.cardTop}>
              <div
                className={styles.avatarCircle}
                style={{ backgroundColor: rev.avatarColor }}
              >
                {rev.reviewerName.charAt(0)}
              </div>
              <div className={styles.authorMeta}>
                <div className={styles.nameRow}>
                  <span className={styles.reviewerName}>{rev.reviewerName}</span>
                  {rev.verified && <span className={styles.verifiedTag}>Đã mua chính hãng</span>}
                </div>
                <div className={styles.starsRow}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFA726" stroke="#FFA726" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                  <span className={styles.timeAgo}>{rev.timeAgo}</span>
                </div>
              </div>
            </div>

            {/* Target Book Reference Link */}
            <Link href={`/tap-truyen/${rev.bookSlug}`} className={styles.bookReferenceLink}>
              <span className={styles.bookTag}>Ấn bản:</span>
              <span className={styles.bookTitleText}>{rev.bookTitle}</span>
            </Link>

            {/* Comment Body */}
            <p className={styles.commentBody}>{rev.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
