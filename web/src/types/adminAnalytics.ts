export interface DailyRevenuePoint {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface RevenueTrendsResponse {
  days: number;
  totalRevenuePeriod: number;
  totalOrdersPeriod: number;
  timeline: DailyRevenuePoint[];
}

export type RevenueTrendsData = RevenueTrendsResponse;

export interface CategoryRevenueShare {
  categoryName: string;
  revenue: number;
  unitsSold: number;
  percentage: number;
}

export interface TopSellingBook {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  unitsSold: number;
  revenue: number;
}
