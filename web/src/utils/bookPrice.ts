import type { Book, BookVariant } from '@/types';

export interface BookPriceDisplay {
  isRange: boolean;
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  originalPrice?: number;
  discountPercent: number;
  hasDiscount: boolean;
  displayPrice: string;
  compactDisplayPrice: string;
}

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

export const getBookPriceDisplay = (
  book: Partial<Book> | null | undefined,
  selectedVariant?: BookVariant | null
): BookPriceDisplay => {
  if (!book) {
    return {
      isRange: false,
      minPrice: 0,
      maxPrice: 0,
      currentPrice: 0,
      discountPercent: 0,
      hasDiscount: false,
      displayPrice: formatCurrency(0),
      compactDisplayPrice: formatCurrency(0),
    };
  }

  // 1. Explicitly selected variant
  if (selectedVariant) {
    const price = Number(selectedVariant.price) || 0;
    const orig = selectedVariant.originalPrice && selectedVariant.originalPrice > price
      ? selectedVariant.originalPrice
      : undefined;
    const discount = orig ? Math.round(((orig - price) / orig) * 100) : 0;

    return {
      isRange: false,
      minPrice: price,
      maxPrice: price,
      currentPrice: price,
      originalPrice: orig,
      discountPercent: discount,
      hasDiscount: discount > 0,
      displayPrice: formatCurrency(price),
      compactDisplayPrice: formatCurrency(price),
    };
  }

  // 2. Book has variants
  if (book.variants && book.variants.length > 0) {
    const validPrices = book.variants
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p > 0);

    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : Number(book.price) || 0;
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : Number(book.price) || 0;

    // Multiple variants with differing prices -> Price Range
    if (book.variants.length > 1 && minPrice < maxPrice) {
      const discounts = book.variants.map((v) => {
        const p = Number(v.price) || 0;
        const o = v.originalPrice ? Number(v.originalPrice) : 0;
        return o > p ? Math.round(((o - p) / o) * 100) : 0;
      });
      const maxDiscount = Math.max(...discounts, 0);

      return {
        isRange: true,
        minPrice,
        maxPrice,
        currentPrice: minPrice,
        discountPercent: maxDiscount,
        hasDiscount: maxDiscount > 0,
        displayPrice: `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`,
        compactDisplayPrice: `Từ ${formatCurrency(minPrice)}`,
      };
    }

    // Single variant or all variants have the same price -> Single Price
    const firstVar = book.variants[0];
    const price = minPrice || Number(firstVar?.price) || Number(book.price) || 0;
    const orig = firstVar?.originalPrice && Number(firstVar.originalPrice) > price
      ? Number(firstVar.originalPrice)
      : (book.originalPrice && Number(book.originalPrice) > price ? Number(book.originalPrice) : undefined);
    const discount = orig ? Math.round(((orig - price) / orig) * 100) : 0;

    return {
      isRange: false,
      minPrice: price,
      maxPrice: price,
      currentPrice: price,
      originalPrice: orig,
      discountPercent: discount,
      hasDiscount: discount > 0,
      displayPrice: formatCurrency(price),
      compactDisplayPrice: formatCurrency(price),
    };
  }

  // 3. Standalone book without variants
  const price = Number(book.price) || 0;
  const orig = book.originalPrice && Number(book.originalPrice) > price
    ? Number(book.originalPrice)
    : undefined;
  const discount = orig ? Math.round(((orig - price) / orig) * 100) : 0;

  return {
    isRange: false,
    minPrice: price,
    maxPrice: price,
    currentPrice: price,
    originalPrice: orig,
    discountPercent: discount,
    hasDiscount: discount > 0,
    displayPrice: formatCurrency(price),
    compactDisplayPrice: formatCurrency(price),
  };
};

export const getSynchronizedVariantStats = (variants: BookVariant[]) => {
  if (!variants || variants.length === 0) {
    return { totalStock: 0, minPrice: 0, maxPrice: 0, isRange: false };
  }
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
  const prices = variants.map((v) => Number(v.price)).filter((p) => !isNaN(p) && p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  return {
    totalStock,
    minPrice,
    maxPrice,
    isRange: variants.length > 1 && minPrice < maxPrice,
  };
};
