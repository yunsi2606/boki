export interface WorkReview {
  id: string;
  seriesSlug: string;
  authorName: string;
  authorAvatarColor: string;
  rating: number;
  content: string;
  createdAt: string;
  likes: number;
}

export interface WorkRatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

const DEFAULT_AVATAR_COLORS = [
  '#EE4D2D', '#FF9800', '#2E7D32', '#1976D2', '#7B1FA2', '#C2185B'
];

export const workReviewService = {
  getReviews(seriesSlug: string): WorkReview[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`boki_work_reviews_${seriesSlug}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addReview(
    seriesSlug: string,
    authorName: string,
    rating: number,
    content: string
  ): WorkReview {
    const current = this.getReviews(seriesSlug);
    const randomColor =
      DEFAULT_AVATAR_COLORS[Math.floor(Math.random() * DEFAULT_AVATAR_COLORS.length)];

    const newReview: WorkReview = {
      id: `wr_${Date.now()}`,
      seriesSlug,
      authorName: authorName.trim() || 'Độc giả Boki',
      authorAvatarColor: randomColor,
      rating: Math.min(5, Math.max(1, rating)),
      content: content.trim(),
      createdAt: 'Vừa xong',
      likes: 0,
    };

    const updated = [newReview, ...current];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`boki_work_reviews_${seriesSlug}`, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save review', err);
      }
    }
    return newReview;
  },

  likeReview(seriesSlug: string, reviewId: string): WorkReview[] {
    const list = this.getReviews(seriesSlug);
    const updated = list.map((item) =>
      item.id === reviewId ? { ...item, likes: item.likes + 1 } : item
    );
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`boki_work_reviews_${seriesSlug}`, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to like review', err);
      }
    }
    return updated;
  },

  getRatingSummary(seriesSlug: string, defaultRating = 4.8): WorkRatingSummary {
    const reviews = this.getReviews(seriesSlug);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (reviews.length === 0) {
      return {
        averageRating: defaultRating,
        totalReviews: 0,
        distribution: { 1: 0, 2: 1, 3: 2, 4: 5, 5: 12 },
      };
    }

    let sum = 0;
    for (const r of reviews) {
      sum += r.rating;
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }

    const average = Math.round((sum / reviews.length) * 10) / 10;
    return {
      averageRating: average,
      totalReviews: reviews.length,
      distribution,
    };
  },
};
