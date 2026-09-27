import type { Book } from '@/types';

export interface SideCardConfig {
  id: string;
  type: 'spotlight' | 'publishers' | 'custom';
  badge?: string;
  title: string;
  description?: string;
  image?: string;
  link?: string;
  publishers?: string[];
}

export interface HeroBannerConfig {
  tag: string;
  title: string;
  highlightText: string;
  subtitle: string;
  bannerImage: string;
  timerEndHours: number; // relative countdown
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  sideCards: SideCardConfig[];
  sideCard1?: {
    badge: string;
    title: string;
    description: string;
    link: string;
  };
  sideCard2?: {
    title: string;
    publishers: string[];
  };
}

export interface VoucherConfig {
  id: string;
  type: 'shipping' | 'product';
  tag: string;
  title: string;
  desc: string;
  progress: number;
  code: string;
  isUsedUp: boolean;
}

export type HomepageSectionType =
  | 'BEST_SELLERS'
  | 'HOT_RECOMMENDED'
  | 'CATEGORY_LIST'
  | 'DAILY_VIP'
  | 'VOUCHERS';

export type DataLoadSource =
  | 'CATEGORY'
  | 'BEST_SELLING'
  | 'LATEST'
  | 'DISCOUNTED'
  | 'VIP_MEMBERS'
  | 'FEATURED_TABS'
  | 'VOUCHERS'
  | 'CUSTOM_KEYWORD';

export type SectionDisplayStyle =
  | 'GRID'
  | 'SLIDER'
  | 'RANKING';

export type SectionSortBy =
  | 'DEFAULT'
  | 'VIEWS_DESC'
  | 'NEWEST'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'DISCOUNT_DESC';

export interface HomepageSectionConfig {
  id: string;
  type: HomepageSectionType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  // Điều kiện load data động
  dataSource: DataLoadSource;
  categoryId?: number;
  categoryName?: string;
  keyword?: string;
  sortBy?: SectionSortBy;
  itemLimit: number;
  // Kiểu hiển thị
  displayStyle: SectionDisplayStyle;
  badgeText?: string;
  showViewAll?: boolean;
  viewAllUrl?: string;
}

export interface HomepageConfig {
  hero: HeroBannerConfig;
  vouchers: VoucherConfig[];
  publishers: string[];
  sections: HomepageSectionConfig[];
}

export const defaultHomepageConfig: HomepageConfig = {
  hero: {
    tag: '⚡ SIÊU ƯU ĐÃI THÁNG 9',
    title: 'ĐỒNG GIÁ',
    highlightText: '49.000đ',
    subtitle: 'Sở hữu trọn đời Ebook, Manga & Light Novel bản quyền độc quyền trên BokiStore. Đọc mượt mà trên mọi thiết bị!',
    bannerImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200&h=600',
    timerEndHours: 8,
    primaryCtaText: 'Sắm Sách Ngay →',
    primaryCtaLink: '/books',
    secondaryCtaText: 'Nhận Mã Giảm 20K',
    secondaryCtaLink: '/#vouchers',
    sideCards: [
      {
        id: 'sc_1',
        type: 'spotlight',
        badge: 'BẢN ĐẶC BIỆT',
        title: 'Overlord & SAO Vol 25',
        description: 'Tặng kèm Bookmark kim loại & Postcard độc quyền',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        link: '/books?category=dac-biet',
      },
      {
        id: 'sc_2',
        type: 'publishers',
        title: '🏢 ĐỐI TÁC NXB HOT',
        publishers: ['AZ VIỆT NAM', 'AMAK', 'KISEKI', 'CẨM PHONG', 'KIM ĐỒNG', 'NHÃ NAM'],
      },
    ],
    sideCard1: {
      badge: 'BẢN ĐẶC BIỆT',
      title: 'Overlord & SAO Vol 25',
      description: 'Tặng kèm Bookmark kim loại & Postcard độc quyền',
      link: '/books?category=dac-biet',
    },
    sideCard2: {
      title: '🏢 ĐỐI TÁC NXB HOT',
      publishers: ['AZ VIỆT NAM', 'AMAK', 'KISEKI', 'CẨM PHONG', 'KIM ĐỒNG', 'NHÃ NAM'],
    },
  },
  vouchers: [
    {
      id: 'v1',
      type: 'shipping',
      tag: 'MÃ VẬN CHUYỂN',
      title: 'Giảm 20K phí vận chuyển, đơn tối thiểu 150K',
      desc: 'Đang có hiệu lực. Đã dùng 38.6%',
      progress: 38.6,
      code: 'FREESHIP20',
      isUsedUp: false,
    },
    {
      id: 'v2',
      type: 'product',
      tag: 'GIẢM GIÁ SẢN PHẨM',
      title: 'Giảm 20K cho Manga/Comic đơn 200K',
      desc: 'Đang có hiệu lực. Đã dùng 100.0%',
      progress: 100,
      code: 'BOKI20K',
      isUsedUp: true,
    },
    {
      id: 'v3',
      type: 'product',
      tag: 'GIẢM GIÁ SẢN PHẨM',
      title: 'Giảm 10K cho đơn bất kỳ từ 99K',
      desc: 'Đang có hiệu lực. Đã dùng 37.3%',
      progress: 37.3,
      code: 'BOKI10K',
      isUsedUp: false,
    },
    {
      id: 'v4',
      type: 'shipping',
      tag: 'MÃ VẬN CHUYỂN',
      title: 'Freeship toàn quốc đơn từ 300K',
      desc: 'Đang có hiệu lực. Đã dùng 52.5%',
      progress: 52.5,
      code: 'FREESHIPMAX',
      isUsedUp: false,
    },
  ],
  publishers: ['AZ VIỆT NAM', 'AMAK', 'KISEKI', 'CẨM PHONG', 'KIM ĐỒNG', 'NHÃ NAM'],
  sections: [
    {
      id: 'sec_best_sellers',
      type: 'BEST_SELLERS',
      title: 'Top Sản Phẩm Bán Chạy',
      subtitle: 'Xếp hạng 10 tựa sách & truyện tranh bán chạy nhất tuần qua',
      enabled: true,
      dataSource: 'BEST_SELLING',
      displayStyle: 'RANKING',
      sortBy: 'VIEWS_DESC',
      itemLimit: 10,
      showViewAll: true,
      viewAllUrl: '/books',
    },
    {
      id: 'sec_hot_recommended',
      type: 'HOT_RECOMMENDED',
      title: 'Gợi Ý Sách & Truyện Hot',
      subtitle: 'Khám phá các phiên bản đặc biệt, boxset giới hạn & bản thường mới nhất',
      enabled: true,
      dataSource: 'FEATURED_TABS',
      displayStyle: 'GRID',
      itemLimit: 8,
      showViewAll: false,
    },
    {
      id: 'sec_manga',
      type: 'CATEGORY_LIST',
      title: 'Truyện Tranh & Manga Nổi Bật',
      subtitle: 'Tuyển tập các bộ truyện tranh đình đám với quà tặng và bookmark giới hạn',
      enabled: true,
      dataSource: 'CATEGORY',
      displayStyle: 'GRID',
      sortBy: 'NEWEST',
      categoryName: 'Sách Thiếu nhi',
      categoryId: 2,
      itemLimit: 8,
      showViewAll: true,
      viewAllUrl: '/books?category=2',
    },
    {
      id: 'sec_novels',
      type: 'CATEGORY_LIST',
      title: 'Tiểu Thuyết & Truyện Chữ Hay Nhất',
      subtitle: 'Những tác phẩm văn học kinh điển & tiểu thuyết ăn khách nhất',
      enabled: true,
      dataSource: 'CATEGORY',
      displayStyle: 'GRID',
      sortBy: 'VIEWS_DESC',
      categoryName: 'Sách Văn học',
      categoryId: 1,
      itemLimit: 8,
      showViewAll: true,
      viewAllUrl: '/books?category=1',
    },
    {
      id: 'sec_daily_vip',
      type: 'DAILY_VIP',
      title: 'Sách Mới Mỗi Ngày – Dành Cho Hội Viên',
      subtitle: 'Độc quyền trải nghiệm đọc thử trọn vẹn dành riêng cho thành viên VIP',
      enabled: true,
      dataSource: 'VIP_MEMBERS',
      displayStyle: 'SLIDER',
      itemLimit: 8,
      showViewAll: true,
      viewAllUrl: '/books',
    },
    {
      id: 'sec_vouchers',
      type: 'VOUCHERS',
      title: 'Mã Giảm Giá & Ưu Đãi Vận Chuyển',
      subtitle: 'Thu thập voucher freeship và giảm giá ngay hôm nay',
      enabled: true,
      dataSource: 'VOUCHERS',
      displayStyle: 'GRID',
      itemLimit: 4,
      showViewAll: false,
    },
  ],
};
