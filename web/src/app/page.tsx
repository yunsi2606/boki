import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

// Mock Circular Categories (Story-style)
const categories = [
  { id: 'c1', name: 'Manga & Comic', icon: '🎨', gradient: 'linear-gradient(45deg, #ff9f0a, #ff2d55)' },
  { id: 'c2', name: 'Light Novel', icon: '⚔️', gradient: 'linear-gradient(45deg, #ff2d55, #bf5af2)' },
  { id: 'c3', name: 'Văn Học', icon: '📖', gradient: 'linear-gradient(45deg, #bf5af2, #0a84ff)' },
  { id: 'c4', name: 'Thiếu Nhi', icon: '🧸', gradient: 'linear-gradient(45deg, #0a84ff, #30d158)' },
  { id: 'c5', name: 'Kỹ Năng', icon: '💡', gradient: 'linear-gradient(45deg, #30d158, #ffd60a)' },
  { id: 'c6', name: 'Hội Viên', icon: '👑', gradient: 'linear-gradient(45deg, #ff9f0a, #ffd60a)' },
  { id: 'c7', name: 'Giảm Giá', icon: '🏷️', gradient: 'linear-gradient(45deg, #ff2d55, #e67e00)' }
];

// Mock Vouchers (Ticket-style)
const vouchers = [
  { id: 'v1', title: 'Freeship Toàn Quốc', desc: 'Đơn từ 150k - Tối đa 30k', type: 'shipping', btn: 'Nhận' },
  { id: 'v2', title: 'Giảm 10% Manga', desc: 'Giảm tối đa 20k đơn bất kỳ', type: 'discount', btn: 'Nhận' },
  { id: 'v3', title: 'Freeship Nội Thành', desc: 'Đơn từ 99k Hà Nội / HCM', type: 'shipping', btn: 'Lưu' },
  { id: 'v4', title: 'Voucher Hội Viên', desc: 'Đồng giá ship 10k mọi đơn', type: 'discount', btn: 'Lưu' }
];

// Mock Book Data (Minimalist Card)
const mockBooks = [
  {
    id: '1',
    title: 'Đại Chúa Tể - Tập 1 (Bản Đặc Biệt)',
    author: 'Thiên Tằm Thổ Đậu',
    views: '12.4K',
    rating: 4.8,
    price: '95.000đ',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Novel',
    discount: 'Giảm 15%'
  },
  {
    id: '2',
    title: 'Sword Art Online - Vol 25: Unital Ring IV',
    author: 'Reki Kawahara',
    views: '45.1K',
    rating: 4.9,
    price: '120.000đ',
    cover: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Light Novel',
    discount: 'Mới'
  },
  {
    id: '3',
    title: 'One Piece - Tập 102 (Bản Giới Hạn)',
    author: 'Eiichiro Oda',
    views: '120.5K',
    rating: 5.0,
    price: '35.000đ',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Manga',
    discount: 'Hot'
  },
  {
    id: '4',
    title: 'Re:Zero - Volume 18: Tân Binh Khởi Đầu',
    author: 'Tappei Nagatsuki',
    views: '18.2K',
    rating: 4.7,
    price: '115.000đ',
    cover: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Light Novel',
    discount: null
  },
  {
    id: '5',
    title: 'Solo Leveling - Tập 3: Trùng Sinh Hầm Ngục',
    author: 'Chugong',
    views: '62.8K',
    rating: 4.9,
    price: '165.000đ',
    cover: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Manhwa',
    discount: 'Hot'
  },
  {
    id: '6',
    title: 'Overlord - Vol 14: Kẻ Diệt Quốc Thế Giới',
    author: 'Kugane Maruyama',
    views: '22.9K',
    rating: 4.8,
    price: '145.000đ',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Light Novel',
    discount: null
  }
];

const mockNewUpdates = [
  {
    id: 'n1',
    title: 'Chú Thuật Hồi Chiến - Tập 20',
    author: 'Gege Akutami',
    views: '88.3K',
    rating: 4.9,
    price: '40.000đ',
    cover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Manga',
    discount: 'Bán chạy'
  },
  {
    id: 'n2',
    title: 'Thám Tử Đã Chết - Tập 5',
    author: 'Nigozyu',
    views: '11.2K',
    rating: 4.6,
    price: '105.000đ',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Light Novel',
    discount: null
  },
  {
    id: 'n3',
    title: 'Đấu Phá Thương Khung - Tập 24',
    author: 'Thiên Tằm Thổ Đậu',
    views: '8.4K',
    rating: 4.5,
    price: '85.000đ',
    cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Novel',
    discount: null
  },
  {
    id: 'n4',
    title: 'Manga Chainsaw Man - Tập 11',
    author: 'Tatsuki Fujimoto',
    views: '92.4K',
    rating: 4.9,
    price: '45.000đ',
    cover: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Manga',
    discount: 'Hot'
  },
  {
    id: 'n5',
    title: 'Lớp Học Đề Cao Thực Lực - Vol 11.5',
    author: 'Syougo Kinugasa',
    views: '34.8K',
    rating: 4.8,
    price: '110.000đ',
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Light Novel',
    discount: null
  },
  {
    id: 'n6',
    title: 'Kim Đồng Manga Spy x Family - Tập 9',
    author: 'Tatsuya Endo',
    views: '104.2K',
    rating: 5.0,
    price: '40.000đ',
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Manga',
    discount: 'Hot'
  }
];

export default function HomePage() {
  return (
    <>
      {/* --- HERO BANNER --- */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>✨ Cùng Boki Chia Sẻ Tri Thức</span>
          <h1 className={styles.title}>
            Mua &amp; Bán Sách Truyện
            <br />
            Tiết Kiệm, Nhanh Chóng
          </h1>
          <p className={styles.subtitle}>
            Sàn thương mại sách cũ, Light Novel, Manga lớn nhất dành cho cộng đồng yêu truyện. Đăng bán dễ dàng trong 30 giây, kết nối người mua gần nhất.
          </p>
          <div className={styles.actions}>
            <Link href="/register">
              <Button size="lg">Đăng Ký Bán Ngay</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Khám Phá Cửa Hàng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- INSTAGRAM STORY STYLE CATEGORIES --- */}
      <section className={styles.container} style={{ paddingTop: '24px' }}>
        <div className={styles.categoriesWrapper}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.categoryItem}>
              <div className={styles.categoryRing} style={{ background: cat.gradient }}>
                <div className={styles.categoryCircle}>
                  <span>{cat.icon}</span>
                </div>
              </div>
              <span className={styles.categoryName}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- TICKET / VOUCHER SYSTEM --- */}
      <section className={`${styles.section} ${styles.voucherSection}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🎫 Săn Vé Ưu Đãi Boki</h2>
          </div>
          <div className={styles.voucherGrid}>
            {vouchers.map((v) => (
              <div
                key={v.id}
                className={`${styles.voucherTicket} ${
                  v.type === 'shipping' ? styles.typeShipping : styles.typeDiscount
                }`}
              >
                <div className={styles.ticketLeft}>
                  <h4 className={styles.voucherTitle}>{v.title}</h4>
                  <p className={styles.voucherDesc}>{v.desc}</p>
                </div>
                <div className={styles.ticketRight}>{v.btn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CAROUSEL SLIDER: TRUYỆN MỚI CẬP NHẬT --- */}
      <section className={`${styles.section} ${styles.container}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🔥 Truyện Mới Cập Nhật</h2>
          <Link href="/books" className={styles.sectionLink}>
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className={styles.carouselContainer}>
          <div className={styles.carousel}>
            {mockNewUpdates.map((book) => (
              <div key={book.id} className={styles.carouselItem}>
                <div className={styles.bookCard}>
                  <div className={styles.coverWrapper}>
                    <img
                      src={book.cover}
                      alt={book.title}
                      className={styles.coverImage}
                      loading="lazy"
                    />
                    <span className={styles.cardTag}>{book.tag}</span>
                    {book.discount && <span className={styles.discountBadge}>{book.discount}</span>}
                  </div>
                  <div className={styles.infoWrapper}>
                    <h3 className={styles.bookTitle}>{book.title}</h3>
                    <p className={styles.bookAuthor}>{book.author}</p>
                    <div className={styles.ratingWrapper}>
                      <span className={styles.starIcon}>★</span>
                      <span>{book.rating}</span>
                      <span>•</span>
                      <span className={styles.viewText}>{book.views} xem</span>
                    </div>
                    <div className={styles.priceWrapper}>
                      <span className={styles.bookPrice}>{book.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NETFLIX-STYLE BIG NUMBER RANKINGS --- */}
      <section className={`${styles.section} ${styles.container}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🏆 Bảng Xếp Hạng Thịnh Hành</h2>
        </div>

        <div className={styles.rankingWrapper}>
          <div className={styles.rankingCarousel}>
            {mockBooks.slice(0, 5).map((book, idx) => (
              <div key={book.id} className={styles.rankingItem}>
                <div className={styles.rankingCard}>
                  <span className={styles.rankNumber}>{idx + 1}</span>
                  <div className={styles.rankingCoverWrapper}>
                    <img
                      src={book.cover}
                      alt={book.title}
                      className={styles.rankingCover}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- GRID SYSTEM: GỢI Ý DÀNH CHO BẠN --- */}
      <section className={`${styles.section} ${styles.container}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>✨ Gợi Ý Dành Cho Bạn</h2>
          <Link href="/books" className={styles.sectionLink}>
            Xem thêm &rarr;
          </Link>
        </div>

        <div className={styles.bookGrid}>
          {mockBooks.map((book) => (
            <div key={book.id} className={styles.bookCard}>
              <div className={styles.coverWrapper}>
                <img
                  src={book.cover}
                  alt={book.title}
                  className={styles.coverImage}
                  loading="lazy"
                />
                <span className={styles.cardTag}>{book.tag}</span>
                {book.discount && <span className={styles.discountBadge}>{book.discount}</span>}
              </div>
              <div className={styles.infoWrapper}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <p className={styles.bookAuthor}>{book.author}</p>
                <div className={styles.ratingWrapper}>
                  <span className={styles.starIcon}>★</span>
                  <span>{book.rating}</span>
                  <span>•</span>
                  <span className={styles.viewText}>{book.views} xem</span>
                </div>
                <div className={styles.priceWrapper}>
                  <span className={styles.bookPrice}>{book.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
