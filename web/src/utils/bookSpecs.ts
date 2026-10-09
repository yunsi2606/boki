import type { Book } from '@/types';

export const getConditionLabel = (condition?: string): string => {
  if (!condition) return 'Mới';
  switch (condition) {
    case 'NEW': return 'Mới (NEW)';
    case 'LIKE_NEW': return 'Như mới (LIKE NEW)';
    case 'GOOD': return 'Tốt (GOOD)';
    case 'FAIR': return 'Chấp nhận được (FAIR)';
    case 'POOR': return 'Cũ/Yếu (POOR)';
    default: return condition;
  }
};

export function getBookDisplaySpecs(book: Book | null): [string, string][] {
  if (!book) return [];
  if (book.publicationDetails && Object.keys(book.publicationDetails).length > 0) {
    return Object.entries(book.publicationDetails).filter(
      ([_, val]) => val !== undefined && val !== null && String(val).trim() !== ''
    ) as [string, string][];
  }
  const legacy: [string, string][] = [];
  if (book.publisher) legacy.push(['Nhà xuất bản', book.publisher]);
  if (book.supplier) legacy.push(['Công ty phát hành', book.supplier]);
  if (book.publicationYear) legacy.push(['Năm xuất bản', String(book.publicationYear)]);
  if (book.language) legacy.push(['Ngôn ngữ', book.language]);
  if (book.format) legacy.push(['Hình thức bìa', book.format]);
  if (book.numberOfPages) legacy.push(['Số trang', `${book.numberOfPages} trang`]);
  if (book.weightGrams) legacy.push(['Trọng lượng', `${book.weightGrams} g`]);
  if (book.dimensions) legacy.push(['Kích thước', book.dimensions]);
  if (book.translator) legacy.push(['Dịch giả', book.translator]);
  return legacy;
}
