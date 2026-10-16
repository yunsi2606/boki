export type CollectionStatus = 'OWNED' | 'SEEKING' | 'WISHLIST' | 'DROPPED';

export type ReadingStatus = 'UNREAD' | 'READING' | 'COMPLETED';

export interface UserMangaCollectionItem {
  id?: string;
  userId?: string;
  scheduleId: string;
  editionId?: string | null;
  status: CollectionStatus;
  purchasePrice?: number | null;
  purchasePlace?: string | null;
  purchasedAt?: string | null;
  readingStatus: ReadingStatus;
  personalRating?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Joined information for rich display
  scheduleTitle?: string;
  seriesName?: string;
  seriesSlug?: string;
  volumeNumber?: number;
  coverUrl?: string;
  publisher?: string;
  estimatedPrice?: number;
  editionName?: string;
}

export interface MangaCollectionStats {
  totalItems: number;
  ownedCount: number;
  seekingCount: number;
  wishlistCount: number;
  totalSpent: number;
  readCount: number;
}

export interface UpdateCollectionItemPayload {
  scheduleId: string;
  editionId?: string | null;
  status: CollectionStatus;
  purchasePrice?: number | null;
  purchasePlace?: string | null;
  purchasedAt?: string | null;
  readingStatus?: ReadingStatus;
  personalRating?: number | null;
  notes?: string | null;
}
