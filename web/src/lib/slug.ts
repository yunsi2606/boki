/**
 * Converts Vietnamese text into an SEO-friendly URL slug.
 * Example: "Đại Chúa Tể - Tập 1" -> "dai-chua-te-tap-1"
 */
export function slugify(text: string): string {
  if (!text) return 'sach';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export function getBookUrl(book: { id?: string; title: string; slug?: string }, variantId?: string): string {
  const slugStr = book.slug || slugify(book.title || 'sach');
  const path = `/books/${slugStr}`;
  return variantId ? `${path}?variant=${variantId}` : path;
}

/**
 * Extracts the Book ID or Slug from a route param.
 */
export function extractBookId(idOrSlug: string): string {
  if (!idOrSlug) return idOrSlug;
  const decoded = decodeURIComponent(idOrSlug);
  if (decoded.includes('--')) {
    const parts = decoded.split('--');
    return parts[parts.length - 1];
  }
  return decoded;
}
