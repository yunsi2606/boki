import type { ReleaseScheduleItem, ReleaseStoreLinkItem } from '@/types/schedule';

export interface InheritedAttributes {
  author?: string;
  artist?: string;
  imprint?: string;
  genres?: string;
  format?: string;
  seriesStatus?: string;
  ageRating?: string;
  specs?: string;
  description?: string;
  originalTitle?: string;
}

/**
 * Deep clone mảng storeLinks, loại bỏ id và scheduleId cũ để backend sinh UUID mới độc lập.
 */
export function cloneStoreLinks(links?: ReleaseStoreLinkItem[]): ReleaseStoreLinkItem[] {
  if (!links || links.length === 0) return [];
  return links
    .filter((l) => l.productUrl && l.productUrl.trim().length > 0)
    .map((l, idx) => ({
      platform: l.platform || 'SHOPEE',
      storeName: l.storeName || '',
      productUrl: l.productUrl.trim(),
      marketPrice: l.marketPrice,
      isPreorder: l.isPreorder ?? false,
      sortOrder: idx,
    }));
}

/**
 * Rút trích tựa đề series dùng để đối chiếu khi seriesSlug chưa có.
 */
function getSeriesKey(title: string): string {
  if (!title) return '';
  return title
    .replace(/(?:\s*-\s*tập|\s*\(tập|\s*#|\s*vol\.?)\s*\d+.*$/i, '')
    .trim()
    .toLowerCase();
}

/**
 * Tìm tập trước đó trong cùng bộ truyện (ưu tiên theo seriesSlug, volumeNumber nhỏ hơn).
 */
export function findPreviousVolume(
  current: {
    id?: string;
    seriesSlug?: string;
    seriesName?: string;
    title?: string;
    volumeNumber?: number;
  },
  allItems: ReleaseScheduleItem[]
): ReleaseScheduleItem | null {
  if (!allItems || allItems.length === 0) return null;

  const currentVol = current.volumeNumber;
  const currentSeriesSlug = current.seriesSlug?.trim().toLowerCase();
  const currentKey = getSeriesKey(current.title || '');

  const sameSeries = allItems.filter((it) => {
    if (current.id && it.id === current.id) return false;
    if (currentSeriesSlug && it.seriesSlug?.trim().toLowerCase() === currentSeriesSlug) return true;
    if (currentKey && getSeriesKey(it.title || '') === currentKey) return true;
    return false;
  });

  if (sameSeries.length === 0) return null;

  // 1. Nếu có volumeNumber, tìm tập có volumeNumber nhỏ hơn gần nhất
  if (currentVol && currentVol > 1) {
    const smallerVols = sameSeries
      .filter((it) => it.volumeNumber !== undefined && it.volumeNumber < currentVol)
      .sort((a, b) => (b.volumeNumber || 0) - (a.volumeNumber || 0));
    if (smallerVols.length > 0) return smallerVols[0];
  }

  // 2. Sắp xếp theo ngày phát hành lùi dần
  const sorted = [...sameSeries].sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
  return sorted[0] || null;
}

/**
 * Tìm tập trước đó trong cùng bộ truyện CÓ CHỨA LIÊN KẾT MUA HÀNG (storeLinks).
 */
export function findPreviousVolumeWithLinks(
  current: {
    id?: string;
    seriesSlug?: string;
    seriesName?: string;
    title?: string;
    volumeNumber?: number;
  },
  allItems: ReleaseScheduleItem[]
): ReleaseScheduleItem | null {
  if (!allItems || allItems.length === 0) return null;

  const currentVol = current.volumeNumber;
  const currentSeriesSlug = current.seriesSlug?.trim().toLowerCase();
  const currentKey = getSeriesKey(current.title || '');

  const candidatesWithLinks = allItems.filter((it) => {
    if (current.id && it.id === current.id) return false;
    if (!it.storeLinks || it.storeLinks.length === 0) return false;
    if (currentSeriesSlug && it.seriesSlug?.trim().toLowerCase() === currentSeriesSlug) return true;
    if (currentKey && getSeriesKey(it.title || '') === currentKey) return true;
    return false;
  });

  if (candidatesWithLinks.length === 0) return null;

  if (currentVol && currentVol > 1) {
    const smallerVols = candidatesWithLinks
      .filter((it) => it.volumeNumber !== undefined && it.volumeNumber < currentVol)
      .sort((a, b) => (b.volumeNumber || 0) - (a.volumeNumber || 0));
    if (smallerVols.length > 0) return smallerVols[0];
  }

  const sorted = [...candidatesWithLinks].sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
  return sorted[0] || null;
}

/**
 * Trích xuất thuộc tính bộ truyện từ tập trước (không gắn coverUrl).
 */
export function extractInheritedAttributes(prev: ReleaseScheduleItem): InheritedAttributes {
  return {
    author: prev.author || undefined,
    artist: prev.artist || undefined,
    imprint: prev.imprint || undefined,
    genres: prev.genres || undefined,
    format: prev.format || undefined,
    seriesStatus: prev.seriesStatus || undefined,
    ageRating: prev.ageRating || undefined,
    specs: prev.specs || undefined,
    description: prev.description || undefined,
    originalTitle: prev.originalTitle || undefined,
  };
}

