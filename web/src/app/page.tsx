import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

// Mock Circular Categories (Story-style with actual book/genre covers)
const categories = [
  { id: 'c1', name: 'Sách Văn học', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #ff9f0a 0%, #ff2d55 100%)' },
  { id: 'c2', name: 'Sách Thiếu nhi', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #ff2d55 0%, #bf5af2 100%)' },
  { id: 'c3', name: 'Sách Kinh tế', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #bf5af2 0%, #0a84ff 100%)' },
  { id: 'c4', name: 'Sách Giáo khoa', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #0a84ff 0%, #30d158 100%)' },
  { id: 'c5', name: 'Kỹ Năng', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #30d158 0%, #ffd60a 100%)' },
  { id: 'c6', name: 'Phát triển bản thân', image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #ff9f0a 0%, #ffd60a 100%)' },
  { id: 'c7', name: 'Sổ tay các loại', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #ff2d55 0%, #e67e00 100%)' }
];

// Mock Vouchers (Ticket-style with progress bars and crop-out stubs)
const vouchers = [
  {
    id: 'v1',
    type: 'shipping',
    tag: 'MÃ VẬN CHUYỂN',
    title: 'Giảm 20K phí vận chuyển, đơn tối...',
    desc: 'Đang có hiệu lực. Đã dùng 38.6%',
    progress: 38.6,
    isUsedUp: false
  },
  {
    id: 'v2',
    type: 'product',
    tag: 'GIẢM GIÁ SẢN PHẨM',
    title: 'Giảm 20K sản phẩm nhất định, đơn...',
    desc: 'Đang có hiệu lực. Đã dùng 100.0%',
    progress: 100,
    isUsedUp: true
  },
  {
    id: 'v3',
    type: 'product',
    tag: 'GIẢM GIÁ SẢN PHẨM',
    title: 'Giảm 10K sản phẩm nhất định, đơn...',
    desc: 'Đang có hiệu lực. Đã dùng 37.3%',
    progress: 37.3,
    isUsedUp: false
  },
  {
    id: 'v4',
    type: 'shipping',
    tag: 'MÃ VẬN CHUYỂN',
    title: 'Giảm 25K phí vận chuyển, đơn tối...',
    desc: 'Đang có hiệu lực. Đã dùng 52.5%',
    progress: 52.5,
    isUsedUp: false
  },
  {
    id: 'v5',
    type: 'product',
    tag: 'GIẢM GIÁ SẢN PHẨM',
    title: 'Giảm 30K sản phẩm nhất định, đơn...',
    desc: 'Đang có hiệu lực. Đã dùng 100.0%',
    progress: 100,
    isUsedUp: true
  },
  {
    id: 'v6',
    type: 'product',
    tag: 'GIẢM GIÁ SẢN PHẨM',
    title: 'Giảm 20K sản phẩm nhất định, đơn...',
    desc: 'Đang có hiệu lực. Đã dùng 57.3%',
    progress: 57.3,
    isUsedUp: false
  }
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

// Rankings specific list
const mockRankings = [
  {
    id: 'r1',
    title: 'Siêu cấp cưng chiều',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'
  },
  {
    id: 'r2',
    title: 'Hôn sự Kinh Cảng',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400'
  },
  {
    id: 'r3',
    title: 'Trùng sinh trở thành đỉnh lưu',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300&h=400'
  },
  {
    id: 'r4',
    title: 'Vợ yêu của nhà ngoại giao',
    cover: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&q=80&w=300&h=400'
  },
  {
    id: 'r5',
    title: 'Định vị bản thân như người xuất sắc',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=400'
  },
  {
    id: 'r6',
    title: 'Cô vợ của đại gia chống gậy',
    cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=300&h=400'
  }
];

// Mock daily books for VIP members
const mockDailyBooks = [
  {
    id: 'd1',
    title: 'CẢ NGÀY BẬN RỘN CẢ ĐỜI TRÌ HOÃN',
    author: 'Steve Chandler',
    views: '24K',
    rating: 4.8,
    price: 'Đọc ngay',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Sách nói',
    badgeType: 'discount49',
    badgeText: '49.000đ ⚡'
  },
  {
    id: 'd2',
    title: 'QUY TẮC NHÌN THẤU BẢN CHẤT',
    author: 'Hoàng Nguyễn',
    views: '15.2K',
    rating: 4.9,
    price: 'Đọc ngay',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Ebook',
    badgeType: 'discount49',
    badgeText: '49.000đ ⚡'
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
    badgeType: 'discount49',
    badgeText: '49.000đ ⚡'
  },
  {
    id: 'd4',
    title: 'Đêm trắng và những câu chuyện khác',
    author: 'Fyodor Dostoevsky',
    views: '45K',
    rating: 4.9,
    price: 'Đọc ngay',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Ebook',
    badgeType: 'vip',
    badgeText: 'HỘI VIÊN 👑'
  },
  {
    id: 'd5',
    title: 'Nhập môn MANIFEST - Giải mã cơ chế',
    author: 'Trí Nguyễn',
    views: '18K',
    rating: 4.7,
    price: 'Đọc ngay',
    cover: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Ebook',
    badgeType: 'discount49',
    badgeText: '49.000đ ⚡'
  },
  {
    id: 'd6',
    title: 'PHÁT TRIỂN CÁ NHÂN VÀ KHỞI NGHIỆP',
    author: 'Brian Tracy',
    views: '54K',
    rating: 4.8,
    price: 'Đọc ngay',
    cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=300&h=400',
    tag: 'Ebook',
    badgeType: 'vip',
    badgeText: 'HỘI VIÊN 👑'
  }
];

// Mock Featured Sellers (Nhà bán nổi bật)
const mockSellers = [
  { id: 's1', name: 'Nhà sách Waka', logo: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=150&h=150', accentColor: '#00C272' },
  { id: 's2', name: 'Evebooks', logo: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=150&h=150', accentColor: '#ff2d55' },
  { id: 's3', name: 'Etabooks', logo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=150&h=150', accentColor: '#0a84ff' },
  { id: 's4', name: 'Akibooks_Official', logo: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=150&h=150', accentColor: '#bf5af2' },
  { id: 's5', name: 'Carobooks', logo: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=150&h=150', accentColor: '#ffd60a' }
];

export default function HomePage() {
  return (
    <>
      {/* --- HERO BANNER (WAKASHOP PROMO SLIDER STYLE) --- */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>⚡ KHÁM PHÁ NGAY</span>
          <h1 className={styles.title}>
            ĐỒNG GIÁ 49K
            <br />
            <span className={styles.titleGradient}>SỞ HỮU E-BOOK TRỌN ĐỜI</span>
          </h1>
          <p className={styles.subtitle}>
            Tiếp cận kho tàng tri thức vô tận, sách nói và truyện tranh bản quyền độc quyền trên BokiShop. Ưu đãi lớn nhất trong tháng này.
          </p>
          <div className={styles.actions}>
            <Link href="/register">
              <Button size="lg">Khám Phá Gói Cước</Button>
            </Link>
            <Link href="/books">
              <Button variant="secondary" size="lg">
                Đăng Ký Đọc Thử
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- CIRCULAR STORY CATEGORIES --- */}
      <section className={styles.container} style={{ paddingTop: '32px' }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>Danh mục</h2>
        <div className={styles.categoriesWrapper}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.categoryItem}>
              <div className={styles.categoryRing} style={{ background: cat.gradient }}>
                <div className={styles.categoryCircle}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={styles.categoryImage}
                    loading="lazy"
                  />
                </div>
              </div>
              <span className={styles.categoryName}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- TICKET / VOUCHER SYSTEM --- */}
      <section className={`${styles.section} ${styles.voucherSection}`} id="vouchers">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mã khuyến mại</h2>
          </div>
          <div className={styles.voucherGrid}>
            {vouchers.map((v) => (
              <div
                key={v.id}
                className={`${styles.voucherTicket} ${v.isUsedUp ? styles.voucherTicketUsedUp : ''}`}
              >
                {/* Left Ticket Tab */}
                <div className={`${styles.ticketLeft} ${v.type === 'shipping' ? styles.ticketLeftShipping : styles.ticketLeftProduct}`}>
                  {v.isUsedUp && <div className={styles.stampUsedUp}>HẾT MÃ</div>}
                  <div className={styles.ticketLeftContent}>
                    {v.type === 'shipping' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.ticketIcon}>
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.ticketIcon}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    )}
                    <span className={styles.ticketLeftTag}>{v.tag}</span>
                  </div>
                </div>

                {/* Right Ticket Tab */}
                <div className={styles.ticketRight}>
                  <h4 className={styles.voucherTitle}>{v.title}</h4>
                  <p className={styles.voucherDesc}>{v.desc}</p>

                  {/* Progress fill */}
                  <div className={styles.progressBarWrapper}>
                    <div
                      className={`${styles.progressBarFill} ${v.isUsedUp ? styles.progressBarFillUsedUp : ''}`}
                      style={{ width: `${v.progress}%` }}
                    ></div>
                  </div>

                  <div className={styles.ticketActions}>
                    <span className={styles.conditionsLink}>Điều kiện</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DAILY NEW BOOKS FOR MEMBERS (HỘI VIÊN) --- */}
      <section className={`${styles.section} ${styles.container}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sách mới mỗi ngày - Dành cho Hội viên!</h2>
          <Link href="/books" className={styles.sectionLink}>
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
                    className={`${styles.discountBadge} ${book.badgeType === 'vip' ? styles.badgeVip : styles.badgeDiscount49
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

      {/* --- NETFLIX-STYLE BIG NUMBER RANKINGS --- */}
      <section className={`${styles.section} ${styles.container}`}>
        <div className={styles.sectionHeader} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
          <h2 className={styles.sectionTitle}>Bảng xếp hạng</h2>
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

      {/* --- NHÀ BÁN NỔI BẬT (FEATURED SELLERS) --- */}
      <section className={`${styles.section} ${styles.container}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Nhà bán nổi bật</h2>
        </div>

        <div className={styles.sellersGrid}>
          {mockSellers.map((seller) => (
            <div key={seller.id} className={styles.sellerCard}>
              <div className={styles.sellerAvatarRing} style={{ borderColor: seller.accentColor }}>
                <div className={styles.sellerAvatarWrapper}>
                  <img
                    src={seller.logo}
                    alt={seller.name}
                    className={styles.sellerAvatar}
                    loading="lazy"
                  />
                </div>
              </div>
              <span className={styles.sellerName}>{seller.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- GRID SYSTEM: GỢI Ý DÀNH CHO BẠN --- */}
      <section className={`${styles.section} ${styles.container}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Gợi Ý Dành Cho Bạn</h2>
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
