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
  timerEndHours: number;
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
  | 'VOUCHERS'
  | 'FLASH_SALE'
  | 'CATEGORY_CIRCLES'
  | 'RECOMMENDATIONS';

export type DataLoadSource =
  | 'CATEGORY'
  | 'BEST_SELLING'
  | 'LATEST'
  | 'DISCOUNTED'
  | 'VIP_MEMBERS'
  | 'FEATURED_TABS'
  | 'VOUCHERS'
  | 'FLASH_SALE'
  | 'PERSONALIZED'
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
  dataSource: DataLoadSource;
  categoryId?: number;
  categoryName?: string;
  keyword?: string;
  sortBy?: SectionSortBy;
  itemLimit: number;
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

export { defaultHomepageConfig } from './defaultHomepageConfig';
