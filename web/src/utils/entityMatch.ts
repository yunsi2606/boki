/**
 * Utility for parsing and matching multi-value metadata entities (e.g. authors, translators, publishers).
 */

export function splitEntityValues(raw: string | null | undefined): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function matchMultiValue(
  fieldValue: string | null | undefined,
  target: string | null | undefined
): boolean {
  if (!fieldValue || !target) return false;
  const targetLower = target.trim().toLowerCase();
  if (!targetLower) return false;

  const items = splitEntityValues(fieldValue).map((item) => item.toLowerCase());
  return items.some((item) => item === targetLower || item.includes(targetLower));
}

export function getSpecFilterParam(label: string): string | null {
  const normalized = label.trim();
  switch (normalized) {
    case 'Bộ sách':
      return 'series';
    case 'Đối tượng':
      return 'audience';
    case 'Nhà xuất bản':
      return 'publisher';
    case 'Công ty phát hành':
      return 'supplier';
    case 'Dịch giả':
      return 'translator';
    case 'Hình thức bìa':
      return 'format';
    default:
      return null;
  }
}
