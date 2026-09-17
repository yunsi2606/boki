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

export interface HomepageConfig {
  hero: HeroBannerConfig;
  vouchers: VoucherConfig[];
  publishers: string[];
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
};
