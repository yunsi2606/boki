import type { Book, BookVariant } from '@/types';

/**
 * Returns the effective maximum purchase quantity allowed for a book or selected variant per order.
 *
 * Precedence Rule:
 * 1. If variant specifies maxOrderQuantity (> 0), variant limit takes precedence.
 * 2. Else if parent book specifies maxOrderQuantity (> 0), book limit applies.
 * 3. Otherwise returns undefined (no purchase quantity limit).
 */
export function getEffectiveMaxOrderQuantity(
  book?: Book | null,
  selectedVariant?: BookVariant | null
): number | undefined {
  if (selectedVariant?.maxOrderQuantity && selectedVariant.maxOrderQuantity > 0) {
    return selectedVariant.maxOrderQuantity;
  }
  if (book?.maxOrderQuantity && book.maxOrderQuantity > 0) {
    return book.maxOrderQuantity;
  }
  return undefined;
}

/**
 * Calculates the maximum allowable order quantity considering available stock
 * and configured purchase quantity limits.
 */
export function getAllowedMaxQuantity(
  book: Book,
  selectedVariant?: BookVariant | null
): number {
  const stock = selectedVariant ? selectedVariant.stockQuantity : book.stockQuantity;
  const maxStock = book.isPreOrder ? Math.max(stock, 99) : stock;
  const limit = getEffectiveMaxOrderQuantity(book, selectedVariant);

  if (limit !== undefined && limit > 0) {
    return Math.min(maxStock, limit);
  }
  return maxStock;
}

/**
 * Validates whether requested quantity exceeds allowed order limit.
 * Returns null if valid, or a localized message if exceeded.
 */
export function checkOrderLimitExceeded(
  book: Book,
  quantity: number,
  selectedVariant?: BookVariant | null
): { exceeded: boolean; limit?: number; message?: string } {
  const limit = getEffectiveMaxOrderQuantity(book, selectedVariant);
  if (limit !== undefined && limit > 0 && quantity > limit) {
    const targetName = selectedVariant ? `bản "${selectedVariant.name}"` : `sách "${book.title}"`;
    return {
      exceeded: true,
      limit,
      message: `Rất tiếc, ${targetName} giới hạn tối đa ${limit} sản phẩm cho mỗi đơn hàng.`,
    };
  }
  return { exceeded: false };
}
