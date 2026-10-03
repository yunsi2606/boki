export type FlashSaleStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface FlashSaleItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  bookAuthor: string;
  bookImageUrl: string;
  originalPrice: number;
  flashSalePrice: number;
  discountPercent: number;
  quantityLimit: number;
  soldQuantity: number;
  userLimit: number;
  isSoldOut: boolean;
}

export interface FlashSale {
  id: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  status: FlashSaleStatus;
  totalItems: number;
  totalQuantityLimit: number;
  totalSoldQuantity: number;
  items: FlashSaleItem[];
  createdAt: string;
}

export interface PublicFlashSale {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: FlashSaleStatus;
  remainingSeconds: number;
  items: FlashSaleItem[];
}

export interface FlashSaleItemInput {
  bookId: string;
  originalPrice: number;
  flashSalePrice: number;
  quantityLimit: number;
  userLimit: number;
}

export interface FlashSaleInput {
  name: string;
  description?: string;
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  items: FlashSaleItemInput[];
}
