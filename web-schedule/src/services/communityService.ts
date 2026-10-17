export interface MangaComment {
  id: string;
  bookTitle: string;
  bookSlug: string;
  authorName: string;
  authorAvatarColor: string;
  content: string;
  createdAt: string;
  likes: number;
  isVerifiedBuyer?: boolean;
}

export interface MangaTierEntry {
  title: string;
  coverUrl: string;
  slug: string;
}

export interface UserTierList {
  id: string;
  title: string;
  authorName: string;
  authorAvatarColor: string;
  isPublic: boolean;
  likes: number;
  createdAt: string;
  tiers: {
    S: MangaTierEntry[];
    A: MangaTierEntry[];
    B: MangaTierEntry[];
    C: MangaTierEntry[];
  };
}

const INITIAL_PUBLIC_TIER_LISTS: UserTierList[] = [
  {
    id: 'tier-1',
    title: 'Top Shounen Đỉnh Nhất Thập Kỷ',
    authorName: 'Minh Quân',
    authorAvatarColor: '#EE4D2D',
    isPublic: true,
    likes: 248,
    createdAt: 'Hôm qua',
    tiers: {
      S: [
        { title: 'Ao Ashi', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200', slug: 'ao-ashi' },
        { title: 'Sakamoto Days', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200', slug: 'sakamoto-days' },
      ],
      A: [
        { title: 'Chainsaw Man', coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200', slug: 'chainsaw-man' },
        { title: 'Jujutsu Kaisen', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=200', slug: 'jujutsu-kaisen' },
      ],
      B: [
        { title: 'Blue Lock', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200', slug: 'blue-lock' },
      ],
      C: [
        { title: 'Tokyo Revengers', coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=200', slug: 'tokyo-revengers' },
      ],
    },
  },
  {
    id: 'tier-2',
    title: 'Manga Thư Giãn & Chữa Lành 2026',
    authorName: 'Hải Yến',
    authorAvatarColor: '#0CA678',
    isPublic: true,
    likes: 195,
    createdAt: '3 ngày trước',
    tiers: {
      S: [
        { title: 'Frieren - Pháp sư tiễn táng', coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200', slug: 'frieren' },
      ],
      A: [
        { title: 'Chung một mái nhà', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=200', slug: 'chung-mot-mai-nha' },
        { title: 'Dược sư tự sự', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200', slug: 'duoc-su-tu-su' },
      ],
      B: [
        { title: 'Skip and Loafer', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200', slug: 'skip-and-loafer' },
      ],
      C: [],
    },
  },
  {
    id: 'tier-3',
    title: 'Top Manga Hành Động Nét Vẽ Đẹp Nhất',
    authorName: 'Bảo Long',
    authorAvatarColor: '#4263EB',
    isPublic: true,
    likes: 142,
    createdAt: '5 ngày trước',
    tiers: {
      S: [
        { title: 'Sakamoto Days', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200', slug: 'sakamoto-days' },
      ],
      A: [
        { title: 'One Punch Man', coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=200', slug: 'one-punch-man' },
      ],
      B: [
        { title: 'Kaiju No. 8', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200', slug: 'kaiju-no-8' },
      ],
      C: [],
    },
  },
];

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
    isVerifiedBuyer: true,
  },
  {
    id: 'c2',
    bookTitle: 'Sakamoto Days - Tập 25',
    bookSlug: 'sakamoto-days-tap-25',
    authorName: 'Hải Đăng',
    authorAvatarColor: '#FF9800',
    content: 'Phân cảnh hành động vẽ đỉnh cao không góc chết. Set quà tặng kèm standee acrylic rất chất lượng.',
    createdAt: '45 phút trước',
    likes: 8,
    isVerifiedBuyer: true,
  },
];

export const communityService = {
  getComments(slug?: string): MangaComment[] {
    if (typeof window === 'undefined') return INITIAL_COMMENTS;
    const raw = localStorage.getItem('boki_manga_comments');
    const all = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
    if (slug) {
      return all.filter((c: MangaComment) => c.bookSlug === slug);
    }
    return all;
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

  getPublicTierLists(): UserTierList[] {
    if (typeof window === 'undefined') return INITIAL_PUBLIC_TIER_LISTS;
    const raw = localStorage.getItem('boki_user_tier_lists');
    let lists: UserTierList[] = raw ? JSON.parse(raw) : INITIAL_PUBLIC_TIER_LISTS;
    // Filter only public tier lists and sort by likes descending (popularity ranking)
    return lists.filter((item) => item.isPublic).sort((a, b) => b.likes - a.likes);
  },

  createTierList(data: Omit<UserTierList, 'id' | 'likes' | 'createdAt'>): UserTierList {
    const lists = this.getPublicTierLists();
    const newList: UserTierList = {
      ...data,
      id: 'tier-' + Date.now(),
      likes: 1,
      createdAt: 'Vừa tạo',
    };
    const updated = [newList, ...lists];
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_user_tier_lists', JSON.stringify(updated));
    }
    return newList;
  },

  likeTierList(id: string): UserTierList[] {
    const raw = localStorage.getItem('boki_user_tier_lists');
    const lists: UserTierList[] = raw ? JSON.parse(raw) : INITIAL_PUBLIC_TIER_LISTS;
    const updated = lists.map((item) =>
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('boki_user_tier_lists', JSON.stringify(updated));
    }
    return updated.filter((item) => item.isPublic).sort((a, b) => b.likes - a.likes);
  },
};
