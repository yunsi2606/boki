import { scheduleApiFetch } from './api';

export interface MangaTierListSummary {
  id: string;
  title: string;
  description: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  totalItems: number;
  topCovers: string[];
  likesCount: number;
  isPublic: boolean;
  createdAt: string;
  timeAgo: string;
}

export const mangaTierListService = {
  async getTopPublicTierLists(limit = 10): Promise<MangaTierListSummary[]> {
    try {
      return await scheduleApiFetch<MangaTierListSummary[]>(`/manga-tier-lists/top-public?limit=${limit}`);
    } catch (err) {
      console.warn('Fallback to local seeded tier lists:', err);
      return [
        {
          id: 'b1111111-1111-1111-1111-111111111001',
          title: 'Hyd Manga List',
          description: 'Tuyển chọn các tác phẩm shonen và hành động đỉnh cao',
          authorHandle: '@jayroring2013',
          authorDisplayName: 'jayroring2013',
          totalItems: 9,
          topCovers: [
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200',
          ],
          likesCount: 142,
          isPublic: true,
          createdAt: new Date().toISOString(),
          timeAgo: '4 ngày trước',
        },
        {
          id: 'b1111111-1111-1111-1111-111111111002',
          title: 'lưu lại kỉ niệm',
          description: 'Bộ sưu tập kỷ niệm những bộ truyện gắn liền tuổi thơ',
          authorHandle: '@stuip21',
          authorDisplayName: 'stuip21',
          totalItems: 64,
          topCovers: [
            'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=200',
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=200',
          ],
          likesCount: 89,
          isPublic: true,
          createdAt: '2026-10-07T10:00:00Z',
          timeAgo: '07/10/26',
        },
        {
          id: 'b1111111-1111-1111-1111-111111111003',
          title: 'my collection',
          description: 'Những bộ manga tâm đắc đang theo dõi',
          authorHandle: '@wuwamaster1512',
          authorDisplayName: 'wuwamaster1512',
          totalItems: 4,
          topCovers: [
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200',
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200',
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200',
          ],
          likesCount: 56,
          isPublic: true,
          createdAt: '2026-10-05T15:30:00Z',
          timeAgo: '05/10/26',
        },
        {
          id: 'b1111111-1111-1111-1111-111111111004',
          title: 'lửng mật',
          description: 'Danh sách đang xây dựng',
          authorHandle: '@daihuuuuu',
          authorDisplayName: 'daihuuuuu',
          totalItems: 0,
          topCovers: [],
          likesCount: 12,
          isPublic: true,
          createdAt: '2026-09-26T09:00:00Z',
          timeAgo: '26/09/26',
        },
      ];
    }
  },
};
