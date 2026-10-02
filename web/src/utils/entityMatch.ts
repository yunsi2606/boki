import type { Book } from '@/types';

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

export interface FilterCriteria {
  supplier?: string | null;
  productType?: 'ALL' | 'PREORDER' | 'COMBO';
  priceRange?: { min: number; max: number } | null;
  author?: string | null;
  series?: string | null;
  publisher?: string | null;
  audience?: string | null;
  translator?: string | null;
  format?: string | null;
}

export function filterBooksByCriteria(books: Book[], criteria: FilterCriteria): Book[] {
  return books.filter((b) => {
    if (criteria.supplier) {
      const matchSup =
        matchMultiValue(b.supplier, criteria.supplier) ||
        matchMultiValue(b.publicationDetails?.['Công ty phát hành'], criteria.supplier);
      if (!matchSup) return false;
    }
    if (criteria.productType === 'PREORDER' && !b.isPreOrder) return false;
    if (criteria.productType === 'COMBO' && !b.isCombo) return false;
    if (
      criteria.priceRange &&
      (b.price < criteria.priceRange.min || b.price >= criteria.priceRange.max)
    ) {
      return false;
    }
    if (criteria.author && !matchMultiValue(b.author, criteria.author)) return false;
    if (criteria.series && !matchMultiValue(b.publicationDetails?.['Bộ sách'], criteria.series)) {
      return false;
    }
    if (
      criteria.publisher &&
      !matchMultiValue(b.publicationDetails?.['Nhà xuất bản'] || b.publisher, criteria.publisher)
    ) {
      return false;
    }
    if (criteria.audience && !matchMultiValue(b.publicationDetails?.['Đối tượng'], criteria.audience)) {
      return false;
    }
    if (
      criteria.translator &&
      !matchMultiValue(b.publicationDetails?.['Dịch giả'] || b.translator, criteria.translator)
    ) {
      return false;
    }
    if (
      criteria.format &&
      !matchMultiValue(b.publicationDetails?.['Hình thức bìa'] || b.format, criteria.format)
    ) {
      return false;
    }
    return true;
  });
}
