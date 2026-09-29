import type { Book } from './index';

export interface RecommendationBook {
  book: Book;
  matchScore: number;
  reasonCode: string;
  reasonLabel: string;
  strategy: 'PERSONALIZED' | 'SIMILAR' | 'CO_PURCHASE' | 'CART_ADDON' | 'TRENDING' | string;
}

export interface FrequentlyBoughtTogetherData {
  mainBook: Book;
  recommendedItems: Book[];
  totalRetailPrice: number;
  bundlePrice: number;
  savingsAmount: number;
  savingsPercent: number;
}

export interface WidgetMetric {
  widgetType: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cartConversions: number;
  orderConversions: number;
  conversionRate: number;
}

export interface RecommendationMetrics {
  totalImpressions: number;
  totalClicks: number;
  overallCtr: number;
  totalCartConversions: number;
  totalOrderConversions: number;
  overallConversionRate: number;
  widgetMetrics: WidgetMetric[];
}

export interface TrackRecommendationPayload {
  sessionId: string;
  bookId: string;
  widgetType: string;
  eventAction: 'IMPRESSION' | 'CLICK' | 'ADD_TO_CART' | 'ORDER';
  positionIndex?: number;
}
