export interface ParsedEditionData {
  editionName: string;
  editionType: 'STANDARD' | 'SPECIAL' | 'LIMITED' | 'BOXSET';
  estimatedPrice?: number;
  gifts?: string;
}

export interface ParsedScheduleData {
  title?: string;
  originalTitle?: string;
  publisher?: string;
  author?: string | string[];
  artist?: string | string[];
  imprint?: string;
  genres?: string | string[];
  format?: string;
  seriesStatus?: string;
  ageRating?: string;
  releaseDate?: string;
  preOrderDate?: string;
  specs?: Record<string, string>;
  editions?: ParsedEditionData[];
  description?: string;
}

export const KNOWN_PUBLISHERS = [
  'Kim Đồng', 'NXB Kim Đồng',
  'Trẻ', 'NXB Trẻ',
  'IPM', 'AZ Việt Nam',
  'Nhã Nam', 'Wings Books',
  'Amak', 'Huy Hoàng',
  'Đinh Tị', 'Thái Hà', 'Quảng Văn',
];

export function normalizeDate(raw: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim();

  const fullMatch = cleaned.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
  if (fullMatch) {
    const day = fullMatch[1].padStart(2, '0');
    const month = fullMatch[2].padStart(2, '0');
    return `${fullMatch[3]}-${month}-${day}`;
  }

  const shortMatch = cleaned.match(/(\d{1,2})[\/\.-](\d{1,2})/);
  if (shortMatch) {
    const day = shortMatch[1].padStart(2, '0');
    const month = shortMatch[2].padStart(2, '0');
    const year = new Date().getFullYear();
    return `${year}-${month}-${day}`;
  }
  return undefined;
}

export function normalizePrice(raw: string): number | undefined {
  if (!raw) return undefined;
  const clean = raw.toLowerCase().replace(/đ|vnd|vnđ|\s/g, '');
  if (clean.endsWith('k')) {
    const num = parseFloat(clean.replace('k', ''));
    if (!isNaN(num)) return Math.round(num * 1000);
  }
  const digits = clean.replace(/[.,]/g, '');
  const val = parseInt(digits, 10);
  return isNaN(val) || val <= 0 ? undefined : val;
}
