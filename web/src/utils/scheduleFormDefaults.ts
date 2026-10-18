import type { CreateEditionPayload } from '@/services/scheduleService';
import type { ParsedScheduleData } from './scheduleTextParserTypes';

export const DEFAULT_SCHEDULE_FORM = {
  publisher: 'Kim Đồng',
  genres: 'Shonen, Hành động',
  format: 'MANGA',
  seriesStatus: 'ONGOING',
  ageRating: '13+',
  specsList: [
    { key: 'Khổ sách', value: '11.3 x 17.6 cm' },
    { key: 'Số trang', value: '192' },
    { key: 'Loại bìa', value: 'Bìa mềm có Jacket' },
  ],
  defaultEditions: [
    {
      editionName: 'Bản Phổ Thông',
      editionType: 'STANDARD' as const,
      releaseDate: null,
      preOrderDate: null,
      sortOrder: 0,
    },
  ],
};

/**
 * Merge non-empty smart fill specs into existing specs list without losing existing items.
 */
export function mergeSpecsList(
  current: Array<{ key: string; value: string }>,
  incoming?: Record<string, string>
): Array<{ key: string; value: string }> {
  if (!incoming || Object.keys(incoming).length === 0) return current;
  const map = new Map(current.map((s) => [s.key, s.value]));
  Object.entries(incoming).forEach(([k, v]) => {
    if (k.trim() && v.trim()) map.set(k.trim(), v.trim());
  });
  return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}

/**
 * Convert parsed editions to form payload.
 */
export function convertParsedEditions(
  editions?: ParsedScheduleData['editions']
): CreateEditionPayload[] | null {
  if (!editions || editions.length === 0) return null;
  return editions.map((e, idx) => ({
    editionName: e.editionName,
    editionType: e.editionType,
    estimatedPrice: e.estimatedPrice,
    gifts: e.gifts || '',
    sortOrder: idx,
  }));
}
