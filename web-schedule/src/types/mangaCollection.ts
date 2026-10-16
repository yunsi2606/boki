export type MangaCollectionStatus = 'OWNED' | 'SEEKING' | 'WISHLIST' | 'DROPPED';

export type ReadingStatus = 'UNREAD' | 'READING' | 'COMPLETED';

export interface UserMangaCollectionItem {
  id: string;
  userId: string;
  scheduleId: string;
  editionId?: string;
  status: MangaCollectionStatus;
  purchasePrice?: number;
  purchasePlace?: string;
  purchasedAt?: string;
  readingStatus: ReadingStatus;
  personalRating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Joined display fields
  scheduleTitle?: string;
  seriesName?: string;
  seriesSlug?: string;
  volumeNumber?: number;
  coverUrl?: string;
  publisher?: string;
  estimatedPrice?: number;
  editionName?: string;
}

export interface UpdateUserMangaCollectionPayload {
  scheduleId: string;
  editionId?: string;
  status?: MangaCollectionStatus;
  purchasePrice?: number;
  purchasePlace?: string;
  purchasedAt?: string;
  readingStatus?: ReadingStatus;
  personalRating?: number;
  notes?: string;
}

export interface CollectionSummaryStats {
  totalVolumes: number;
  totalSpent: number;
  ownedCount: number;
  wishlistCount: number;
  readingCount: number;
}
