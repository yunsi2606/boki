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
  editions: ReleaseScheduleEditionItem[];
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
