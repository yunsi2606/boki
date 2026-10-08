export type ScheduleFilterType = 'ALL' | 'PREORDER' | 'RECENT';

export interface ReleaseScheduleItem {
  id: string;
  title: string;
  author: string;
  publisher: string;
  supplier: string;
  price: number;
  originalPrice?: number;
  coverUrl: string;
  isPreOrder: boolean;
  preOrderDays?: number | null;
  releaseDate: string; // YYYY-MM-DD
  releaseDateDisplay: string; // "15/10/2026"
  statusBadge: 'PREORDER' | 'RECENT' | 'RELEASED';
  bonusGifts?: string | null;
  slug: string;
}

export interface ReleaseDateGroup {
  dateKey: string; // e.g. "2026-10-02" or "2026-10"
  dateLabel: string; // e.g. "Tháng 10/2026" or "02/10/2026"
  isTodayOrFuture: boolean;
  items: ReleaseScheduleItem[];
}
