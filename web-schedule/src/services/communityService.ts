export interface MangaComment {
  id: string;
  bookTitle: string;
  bookSlug: string;
  authorName: string;
  authorAvatarColor: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface TierManga {
  id: string;
  title: string;
  coverUrl: string;
  rank: 'S' | 'A' | 'B' | 'C';
}

export interface CustomRankItem {
  id: string;
  rank: number;
  title: string;
  votes: number;
  coverUrl: string;
  seriesSlug: string;
}

export interface CustomRankTopic {
  id: string;
  topicTitle: string;
  badge: string;
  items: CustomRankItem[];
}

const INITIAL_COMMENTS: MangaComment[] = [
  {
    id: 'c1',
    bookTitle: 'Ao Ashi - Tân binh sân cỏ - Tập 7',
    bookSlug: 'ao-ashi-tan-binh-san-co-tap-7',
    authorName: 'Quân Minh',
    authorAvatarColor: '#EE4D2D',
    content: 'Tập 7 này trận đấu kịch tính nghẹt thở từng pha chuyền bóng! Kim Đồng in giấy xốp nhẹ, gáy phẳng đọc rất êm tay.',
    createdAt: '15 phút trước',
    likes: 12,
  },
  {
    id: 'c2',
    bookTitle: 'Sakamoto Days - Tập 25',
    bookSlug: 'sakamoto-days-tap-25',
    authorName: 'Hải Đăng',
    authorAvatarColor: '#FF9800',
    content: 'Phân cảnh hành động vẽ đỉnh cao không góc chết. Ai săn được bản giới hạn kèm standee acrylic nhớ khoe nhé!',
    createdAt: '45 phút trước',
    likes: 8,
  },
  {
    id: 'c3',
    bookTitle: 'Chung một mái nhà - Tập 7',
    bookSlug: 'chung-mot-mai-nha-tap-7',
    authorName: 'Bảo Trâm',
    authorAvatarColor: '#2B8A3E',
    content: 'Bản dịch Wings Books vẫn mượt mà hóm hỉnh. Set 2 bookmark bế hình in sắc nét đáng tiền mua sưu tầm.',
    createdAt: '2 giờ trước',
    likes: 19,
  },
];

const INITIAL_TIERS: TierManga[] = [
  { id: 't1', title: 'Ao Ashi', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300', rank: 'S' },
  { id: 't2', title: 'Sakamoto Days', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300', rank: 'S' },
  { id: 't3', title: 'Frieren', coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300', rank: 'A' },
  { id: 't4', title: 'Chung Một Mái Nhà', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=300', rank: 'A' },
  { id: 't5', title: 'Dược Sư Tự Sự', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300', rank: 'B' },
];

const INITIAL_RANKINGS: CustomRankTopic[] = [
  {
    id: 'top-sports',
    topicTitle: 'Top Manga Thể Thao Đỉnh Nhất',
    badge: 'HOT THÁNG NÀY',
    items: [
      { id: 'r1', rank: 1, title: 'Ao Ashi - Tân binh sân cỏ', votes: 1420, coverUrl: '', seriesSlug: 'ao-ashi' },
      { id: 'r2', rank: 2, title: 'Blue Lock - Tập 15', votes: 1180, coverUrl: '', seriesSlug: 'blue-lock' },
      { id: 'r3', rank: 3, title: 'Haikyuu!! - Chàng khổng lồ tí hon', votes: 940, coverUrl: '', seriesSlug: 'haikyuu' },
    ],
  },
  {
    id: 'top-action',
    topicTitle: 'Top Hành Động Mãn Nhãn',
    badge: 'CỘNG ĐỒNG VOTE',
    items: [
      { id: 'r4', rank: 1, title: 'Sakamoto Days - Tập 25', votes: 1650, coverUrl: '', seriesSlug: 'sakamoto-days' },
      { id: 'r5', rank: 2, title: 'Chainsaw Man - Tập 14', votes: 1390, coverUrl: '', seriesSlug: 'chainsaw-man' },
      { id: 'r6', rank: 3, title: 'Jujutsu Kaisen - Tập 26', votes: 1210, coverUrl: '', seriesSlug: 'jujutsu-kaisen' },
    ],
  },
];

export const communityService = {
  getComments(): MangaComment[] {
    if (typeof window === 'undefined') return INITIAL_COMMENTS;
    const raw = localStorage.getItem('boki_manga_comments');
    if (!raw) {
      localStorage.setItem('boki_manga_comments', JSON.stringify(INITIAL_COMMENTS));
      return INITIAL_COMMENTS;
    }
    try { return JSON.parse(raw); } catch { return INITIAL_COMMENTS; }
  },

  addComment(comment: Omit<MangaComment, 'id' | 'createdAt' | 'likes'>): MangaComment {
    const list = this.getComments();
    const newComment: MangaComment = {
      ...comment,
      id: 'c_' + Date.now(),
      createdAt: 'Vừa xong',
      likes: 0,
    };
    const updated = [newComment, ...list];
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_manga_comments', JSON.stringify(updated));
    }
    return newComment;
  },

  getTierList(): { tiers: TierManga[]; isPublic: boolean } {
    if (typeof window === 'undefined') return { tiers: INITIAL_TIERS, isPublic: true };
    const rawTiers = localStorage.getItem('boki_tier_list');
    const rawPub = localStorage.getItem('boki_tier_public');
    const tiers = rawTiers ? JSON.parse(rawTiers) : INITIAL_TIERS;
    const isPublic = rawPub ? JSON.parse(rawPub) : true;
    return { tiers, isPublic };
  },

  updateTierVisibility(isPublic: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_tier_public', JSON.stringify(isPublic));
    }
  },

  updateMangaRank(id: string, newRank: 'S' | 'A' | 'B' | 'C') {
    const { tiers } = this.getTierList();
    const updated = tiers.map((t) => (t.id === id ? { ...t, rank: newRank } : t));
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_tier_list', JSON.stringify(updated));
    }
    return updated;
  },

  getCustomRankings(): CustomRankTopic[] {
    if (typeof window === 'undefined') return INITIAL_RANKINGS;
    const raw = localStorage.getItem('boki_custom_rankings');
    if (!raw) {
      localStorage.setItem('boki_custom_rankings', JSON.stringify(INITIAL_RANKINGS));
      return INITIAL_RANKINGS;
    }
    try { return JSON.parse(raw); } catch { return INITIAL_RANKINGS; }
  },

  voteItem(topicId: string, itemId: string): CustomRankTopic[] {
    const topics = this.getCustomRankings();
    const updated = topics.map((t) => {
      if (t.id !== topicId) return t;
      return {
        ...t,
        items: t.items
          .map((i) => (i.id === itemId ? { ...i, votes: i.votes + 1 } : i))
          .sort((a, b) => b.votes - a.votes)
          .map((item, idx) => ({ ...item, rank: idx + 1 })),
      };
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_custom_rankings', JSON.stringify(updated));
    }
    return updated;
  },
};
