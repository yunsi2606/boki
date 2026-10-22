export interface GiveawayPrize {
  id: string;
  prizeTier: string; // FIRST, SECOND, THIRD, CONSOLATION, STANDARD
  prizeName: string;
  quantity: number;
  displayOrder: number;
  scheduleId?: string;
  scheduleTitle?: string;
  scheduleCoverUrl?: string;
}

export interface GiveawayCampaign {
  id: string;
  title: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  scheduleId?: string;
  scheduleTitle?: string;
  prizeStructureType: string;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'DRAWN';
  startDate: string;
  endDate: string;
  drawDate?: string;
  winningNumber?: number;
  totalWinnersCount: number;
  totalEntriesCount: number;
  createdAt: string;
}

export interface GiveawayEntry {
  id: string;
  campaignId: string;
  fullName: string;
  email: string;
  phone: string;
  luckyNumber: number;
  comment?: string;
  isWinner: boolean;
  prizeId?: string;
  prizeName?: string;
  prizeTier?: string;
  prizeRank?: number;
  createdAt: string;
}

export interface GiveawayCampaignDetail extends GiveawayCampaign {
  scheduleCoverUrl?: string;
  prizes: GiveawayPrize[];
  winners: GiveawayEntry[];
}

export interface GiveawaySubmitEntryRequest {
  fullName: string;
  email: string;
  phone: string;
  luckyNumber: number;
  comment?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
