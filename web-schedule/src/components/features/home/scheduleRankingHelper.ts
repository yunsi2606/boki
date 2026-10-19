import type { ReleaseScheduleItem } from '@/types/schedule';

export type HomeScheduleFilterTab = 'SMART' | 'UPCOMING' | 'RECENTLY_ADDED' | 'SPECIAL';

export function getFilteredAndRankedSchedules(
  schedules: ReleaseScheduleItem[],
  tab: HomeScheduleFilterTab,
  limit = 15
): ReleaseScheduleItem[] {
  if (!schedules || schedules.length === 0) return [];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nowMs = now.getTime();

  switch (tab) {
    case 'UPCOMING': {
      // Sắp phát hành: từ hôm nay trở đi, ưu tiên ngày gần nhất
      const upcoming = schedules.filter((s) => s.releaseDate && s.releaseDate >= todayStr);
      upcoming.sort((a, b) => {
        const diff = a.releaseDate.localeCompare(b.releaseDate);
        if (diff !== 0) return diff;
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      });
      return upcoming.slice(0, limit);
    }

    case 'RECENTLY_ADDED': {
      // Vừa lên lịch / cập nhật mới nhất
      const copy = [...schedules];
      copy.sort((a, b) => {
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        return timeB - timeA;
      });
      return copy.slice(0, limit);
    }

    case 'SPECIAL': {
      // Các ấn bản có bản đặc biệt / giới hạn / box set
      const specials = schedules.filter((s) =>
        s.editions?.some((e) => ['SPECIAL', 'LIMITED', 'BOXSET'].includes(e.editionType))
      );
      specials.sort((a, b) => {
        const aUpcoming = a.releaseDate >= todayStr ? 1 : 0;
        const bUpcoming = b.releaseDate >= todayStr ? 1 : 0;
        if (aUpcoming !== bUpcoming) return bUpcoming - aUpcoming;
        return a.releaseDate.localeCompare(b.releaseDate);
      });
      return specials.slice(0, limit);
    }

    case 'SMART':
    default: {
      // Thuật toán chấm điểm trọng số thông minh
      const scoredItems = schedules.map((item) => {
        let score = 0;

        // 1. Khoảng cách ngày phát hành so với hôm nay
        if (item.releaseDate) {
          const itemDate = new Date(item.releaseDate);
          const diffDays = Math.round((itemDate.getTime() - nowMs) / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= 7) {
            score += 120 - diffDays * 5; // Cực nóng trong tuần này: 85 - 120 điểm
          } else if (diffDays > 7 && diffDays <= 14) {
            score += 85; // Tuần tới
          } else if (diffDays > 14 && diffDays <= 30) {
            score += 55; // Trong tháng
          } else if (diffDays < 0 && diffDays >= -7) {
            score += 65; // Vừa phát hành trong 7 ngày qua
          } else if (diffDays < -7 && diffDays >= -14) {
            score += 25;
          } else {
            score -= 50; // Quá 14 ngày trước: hạ độ ưu tiên
          }
        }

        // 2. Thời điểm cập nhật dữ liệu (createdAt / updatedAt)
        const updatedTime = item.updatedAt || item.createdAt;
        if (updatedTime) {
          const updateAgeHours = (nowMs - new Date(updatedTime).getTime()) / (1000 * 60 * 60);
          if (updateAgeHours >= 0 && updateAgeHours <= 24) {
            score += 50;
          } else if (updateAgeHours <= 72) {
            score += 30;
          } else if (updateAgeHours <= 168) {
            score += 15;
          }
        }

        // 3. Có bản đặc biệt hoặc liên kết sách Boki
        const hasSpecial = item.editions?.some((e) =>
          ['SPECIAL', 'LIMITED', 'BOXSET'].includes(e.editionType)
        );
        if (hasSpecial) score += 20;

        const hasLinkedBook = item.editions?.some((e) => e.linkedBook || e.bookId);
        if (hasLinkedBook) score += 15;

        // 4. Lượt thích / quan tâm nhẹ
        if (item.likesCount) score += Math.min(item.likesCount / 20, 15);

        return { item, score };
      });

      scoredItems.sort((a, b) => b.score - a.score);

      // 5. Cân bằng đa dạng nhà xuất bản (Diversity interleave)
      const ranked: ReleaseScheduleItem[] = [];
      const pool = [...scoredItems];
      const pubCountMap: Record<string, number> = {};

      while (pool.length > 0 && ranked.length < limit) {
        let chosenIdx = 0;
        for (let i = 0; i < Math.min(pool.length, 6); i++) {
          const pub = pool[i].item.publisher || 'Unknown';
          const recentCount = pubCountMap[pub] || 0;
          if (recentCount < 2) {
            chosenIdx = i;
            break;
          }
        }

        const chosen = pool.splice(chosenIdx, 1)[0].item;
        ranked.push(chosen);

        const pub = chosen.publisher || 'Unknown';
        pubCountMap[pub] = (pubCountMap[pub] || 0) + 1;
        for (const p of Object.keys(pubCountMap)) {
          if (p !== pub) pubCountMap[p] = Math.max(0, pubCountMap[p] - 1);
        }
      }

      return ranked;
    }
  }
}
