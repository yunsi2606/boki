import type { ReleaseScheduleItem, ReleaseScheduleEditionItem } from '@/types/schedule';

/**
 * Tự động tính toán tên tập và số tập tiếp theo dựa trên tựa đề hoặc volumeNumber cũ.
 */
export function calculateNextVolumeTitle(
  title: string,
  volumeNumber?: number
): { nextTitle: string; nextVolume?: number } {
  const volRegex = /(.*?(?:tập|vol\.?|volume|quyển)\s*)(\d+)(.*)/i;
  const match = title.match(volRegex);

  if (match) {
    const prefix = match[1];
    const currentNum = parseInt(match[2], 10);
    const suffix = match[3];
    const nextNum = currentNum + 1;
    return {
      nextTitle: `${prefix}${nextNum}${suffix}`,
      nextVolume: nextNum,
    };
  }

  const hashRegex = /(.*?#\s*)(\d+)(.*)/;
  const hashMatch = title.match(hashRegex);
  if (hashMatch) {
    const nextNum = parseInt(hashMatch[2], 10) + 1;
    return {
      nextTitle: `${hashMatch[1]}${nextNum}${hashMatch[3]}`,
      nextVolume: nextNum,
    };
  }

  if (volumeNumber && volumeNumber > 0) {
    return {
      nextTitle: `${title} - Tập ${volumeNumber + 1}`,
      nextVolume: volumeNumber + 1,
    };
  }

  return { nextTitle: title, nextVolume: undefined };
}

/**
 * Tự động tính tên gốc của tập tiếp theo nếu có số ở cuối tên gốc.
 */
export function calculateNextOriginalTitle(originalTitle?: string): string {
  if (!originalTitle) return '';
  const match = originalTitle.match(/(.*?\s*)(\d+)$/);
  if (match) {
    const nextNum = parseInt(match[2], 10) + 1;
    return `${match[1]}${nextNum}`;
  }
  return originalTitle;
}

/**
 * Tạo dữ liệu tập mới từ thông tin tập cũ:
 * - Giữ lại: thông tin chung (NXB, tác giả, họa sĩ, thể loại, specs động, series...)
 * - Loại bỏ/reset: ảnh bìa, phiên bản, giá bán, quà tặng, ngày phát hành, id.
 */
export function createNextVolumeItem(oldItem: ReleaseScheduleItem): ReleaseScheduleItem {
  const { nextTitle, nextVolume } = calculateNextVolumeTitle(
    oldItem.title,
    oldItem.volumeNumber
  );
  const nextOriginalTitle = calculateNextOriginalTitle(oldItem.originalTitle);
  const today = new Date().toISOString().slice(0, 10);

  const cleanStandardEdition: ReleaseScheduleEditionItem = {
    editionName: 'Bản Phổ Thông',
    editionType: 'STANDARD',
    releaseDate: today,
    preOrderDate: null,
    status: 'SCHEDULED',
    coverUrl: '',
    gifts: '',
    bookId: null,
    sortOrder: 0,
  };

  return {
    ...oldItem,
    id: '', // Đặt rỗng để xác định đây là tạo mới
    slug: '',
    title: nextTitle,
    originalTitle: nextOriginalTitle,
    volumeNumber: nextVolume ?? (oldItem.volumeNumber ? oldItem.volumeNumber + 1 : undefined),
    coverUrl: '', // Reset ảnh bìa
    releaseDate: today,
    preOrderDate: '',
    editions: [cleanStandardEdition], // Reset phiên bản & giá & quà tặng
    storeLinks: [],
    changelogs: [],
  };
}
