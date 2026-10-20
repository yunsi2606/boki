import type { OcrParsedBookItem, OcrScheduleScanResponse } from '@/types/schedule';
import type { CreateSchedulePayload } from '@/services/scheduleService';

export function groupStagingItemsToPayloads(
  items: OcrParsedBookItem[],
  scanResult?: OcrScheduleScanResponse | null
): CreateSchedulePayload[] {
  const groupedMap = new Map<string, CreateSchedulePayload>();

  for (const item of items) {
    const key = item.computedSlug || item.title.trim().toLowerCase();
    const editionPayload = {
      editionName: item.editionName || 'Bản thường',
      editionType: item.editionType || 'STANDARD',
      releaseDate: item.releaseDate,
      estimatedPrice: item.estimatedPrice,
      gifts: item.gifts || undefined,
      coverUrl: item.coverUrl || undefined,
      status: 'SCHEDULED' as const,
      bookId: item.matchedBookId || null,
    };

    if (groupedMap.has(key)) {
      groupedMap.get(key)!.editions?.push(editionPayload);
    } else {
      groupedMap.set(key, {
        title: item.title.trim(),
        originalTitle: item.originalTitle?.trim() || undefined,
        publisher: item.publisher || scanResult?.detectedPublisher || 'NXB Kim Đồng',
        author: item.author?.trim() || undefined,
        releaseDate: item.releaseDate,
        coverUrl: item.coverUrl || undefined,
        description: item.description || undefined,
        status: 'SCHEDULED',
        editions: [editionPayload],
      });
    }
  }

  return Array.from(groupedMap.values());
}
