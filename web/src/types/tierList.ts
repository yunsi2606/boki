export interface MangaTierListSummary {
  id: string;
  title: string;
  description?: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  totalItems: number;
  topCovers: string[];
  likesCount: number;
  isPublic: boolean;
  createdAt: string;
  timeAgo: string;
}

export interface MangaTierListItem {
  id: string;
  scheduleId: string;
  title: string;
  coverUrl?: string;
  publisher?: string;
  tierRank: string;
  sortOrder: number;
}

export interface MangaTierListDetail extends MangaTierListSummary {
  items: MangaTierListItem[];
}

export interface CreateTierListPayload {
  title: string;
  description?: string;
  isPublic: boolean;
  scheduleIds: string[];
}
