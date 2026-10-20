export interface TierDefinition {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface TierRankedMangaItem {
  id: string;
  scheduleId: string;
  title: string;
  coverUrl?: string;
  publisher?: string;
  tierRank: string;
  sortOrder: number;
}

export interface MangaTierListSummary {
  id: string;
  title: string;
  description: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  totalItems: number;
  topCovers: string[];
  likesCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isPublic: boolean;
  public?: boolean;
  createdAt: string;
  timeAgo: string;
}

export interface MangaTierListDetail {
  id: string;
  title: string;
  description: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  authorId?: string;
  isOwner?: boolean;
  totalItems: number;
  likesCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isPublic: boolean;
  public?: boolean;
  tiersConfig?: string;
  createdAt: string;
  items: TierRankedMangaItem[];
}

export interface CreateTierListPayload {
  title: string;
  description?: string;
  isPublic: boolean;
  tiersConfig?: string;
  rankedItems: {
    scheduleId: string;
    tierRank: string;
    sortOrder: number;
  }[];
}

export const DEFAULT_TIERS: TierDefinition[] = [
  { id: 'tier-s', name: 'S', color: '#EE4D2D', order: 0 },
  { id: 'tier-a', name: 'A', color: '#FF9800', order: 1 },
  { id: 'tier-b', name: 'B', color: '#F59F00', order: 2 },
  { id: 'tier-c', name: 'C', color: '#10B981', order: 3 },
  { id: 'tier-d', name: 'D', color: '#06B6D4', order: 4 },
  { id: 'tier-e', name: 'E', color: '#6366F1', order: 5 },
  { id: 'tier-f', name: 'F', color: '#6B7280', order: 6 },
];
