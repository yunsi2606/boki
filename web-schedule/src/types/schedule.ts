export type ReleaseEditionType = 'STANDARD' | 'SPECIAL' | 'LIMITED' | 'BOXSET';

export type ReleaseScheduleStatus = 'SCHEDULED' | 'RELEASED' | 'DELAYED' | 'CANCELLED';

export interface LinkedBookInfo {
  id: string;
  title: string;
  slug: string;
  price: number;
  stockQuantity: number;
  isPreOrder: boolean;
  coverUrl?: string;
  status: string;
}

export interface ReleaseScheduleEditionItem {
  id?: string;
  scheduleId?: string;
  editionName: string;
  editionType: ReleaseEditionType;
  releaseDate?: string | null;
  preOrderDate?: string | null;
  effectiveReleaseDate?: string;
  effectivePreOrderDate?: string;
  estimatedPrice?: number;
  gifts?: string;
  coverUrl?: string;
  status: ReleaseScheduleStatus;
  bookId?: string | null;
  linkedBook?: LinkedBookInfo;
  sortOrder?: number;
}

export interface ReleaseStoreLinkItem {
  id?: string;
  scheduleId?: string;
  editionId?: string;
  platform: 'BOKI_STORE' | 'SHOPEE' | 'TIKTOK_SHOP' | 'FAHASA' | 'OTHER';
  storeName?: string;
  productUrl: string;
  marketPrice?: number;
  isPreorder?: boolean;
  sortOrder?: number;
}

export interface ReleaseChangelogItem {
  id?: string;
  scheduleId?: string;
  editionId?: string;
  changeType: 'DATE_DELAY' | 'PRICE_CHANGE' | 'EDITION_UPDATE' | 'ANNOUNCEMENT';
  oldValue?: string;
  newValue?: string;
  title: string;
  reason?: string;
  sourceUrl?: string;
  createdAt?: string;
}

export interface ReleaseScheduleItem {
  id: string;
  title: string;
  originalTitle?: string;
  publisher: string;
  author?: string;
  releaseDate: string;
  preOrderDate?: string;
  coverUrl?: string;
  description?: string;
  status: ReleaseScheduleStatus;
  slug?: string;
  seriesName?: string;
  seriesSlug?: string;
  volumeNumber?: number;
  totalVolumes?: number;
  editions: ReleaseScheduleEditionItem[];
  storeLinks?: ReleaseStoreLinkItem[];
  changelogs?: ReleaseChangelogItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type ScheduleTabFilter = 'ALL' | 'LINKED' | 'SPECIAL';
export type ScheduleViewMode = 'DAY' | 'MONTH';
export type ScheduleEventType = 'PRE_ORDER' | 'RELEASE';

export interface ScheduleTimelineItem {
  schedule: ReleaseScheduleItem;
  eventType: ScheduleEventType;
  targetEditionIdx: number;
  eventDate: string;
}

export interface ScheduleTimelineGroup {
  dateKey: string;
  dateLabel: string;
  items: ScheduleTimelineItem[];
}
