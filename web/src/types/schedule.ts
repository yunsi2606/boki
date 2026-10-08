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

export interface ReleaseScheduleItem {
  id: string;
  title: string;
  originalTitle?: string;
  publisher: string;
  author?: string;
  releaseDate: string; // ISO YYYY-MM-DD
  estimatedPrice?: number;
  editionType: ReleaseEditionType;
  gifts?: string;
  coverUrl?: string;
  description?: string;
  status: ReleaseScheduleStatus;
  bookId?: string;
  linkedBook?: LinkedBookInfo;
  createdAt?: string;
  updatedAt?: string;
}

export type ScheduleTabFilter = 'ALL' | 'LINKED' | 'SPECIAL';

export interface ScheduleTimelineGroup {
  dateKey: string;
  dateLabel: string;
  items: ReleaseScheduleItem[];
}
