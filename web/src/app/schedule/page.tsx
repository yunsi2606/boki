'use client';

import { useEffect, useState, useMemo } from 'react';
import { bookService } from '@/services/bookService';
import type { Book } from '@/types';
import type {
  ScheduleFilterType,
  ReleaseScheduleItem,
  ReleaseDateGroup,
} from '@/types/schedule';
import ScheduleFilterBar from '@/components/features/schedule/ScheduleFilterBar';
import ScheduleTimelineGroup from '@/components/features/schedule/ScheduleTimelineGroup';
import styles from './schedule.module.css';

export default function ReleaseSchedulePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ScheduleFilterType>('ALL');
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScheduleBooks() {
      try {
        setLoading(true);
        const data = await bookService.searchBooks();
        setBooks(data || []);
      } catch (err) {
        console.error('Failed to load schedule books', err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchScheduleBooks();
  }, []);

  // Transform books to ReleaseScheduleItem
  const scheduleItems = useMemo<ReleaseScheduleItem[]>(() => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    return books.map((b) => {
      const createdDate = b.createdAt ? new Date(b.createdAt) : new Date();
      const isRecent = createdDate >= twoWeeksAgo && !b.isPreOrder;
      const statusBadge: ReleaseScheduleItem['statusBadge'] = b.isPreOrder
        ? 'PREORDER'
        : isRecent
        ? 'RECENT'
        : 'RELEASED';

      const releaseDate = createdDate.toISOString().slice(0, 10);
      const releaseDateDisplay = `${createdDate.getDate().toString().padStart(2, '0')}/${(createdDate.getMonth() + 1).toString().padStart(2, '0')}/${createdDate.getFullYear()}`;

      return {
        id: b.id,
        title: b.title,
        author: b.author,
        publisher: b.publisher || 'Nhà xuất bản',
        supplier: b.supplier || b.publisher || 'Đang cập nhật',
        price: b.price,
        originalPrice: b.originalPrice,
        coverUrl: b.imageUrls?.[0] || '',
        isPreOrder: Boolean(b.isPreOrder),
        preOrderDays: b.preOrderDays,
        releaseDate,
        releaseDateDisplay,
        statusBadge,
        slug: b.slug || b.id,
      };
    }).sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  }, [books]);

  // Unique Publishers
  const publishers = useMemo(() => {
    const set = new Set<string>();
    scheduleItems.forEach((item) => {
      if (item.supplier && item.supplier.trim() && item.supplier !== 'Đang cập nhật') {
        set.add(item.supplier.trim());
      }
    });
    return Array.from(set).sort();
  }, [scheduleItems]);

  // Counts for filter tabs
  const counts = useMemo(() => {
    const preorder = scheduleItems.filter((i) => i.isPreOrder).length;
    const recent = scheduleItems.filter((i) => i.statusBadge === 'RECENT').length;
    return { all: scheduleItems.length, preorder, recent };
  }, [scheduleItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return scheduleItems.filter((item) => {
      if (filterType === 'PREORDER' && !item.isPreOrder) return false;
      if (filterType === 'RECENT' && item.statusBadge !== 'RECENT') return false;
      if (selectedPublisher && item.supplier !== selectedPublisher) return false;
      return true;
    });
  }, [scheduleItems, filterType, selectedPublisher]);

  // Group items by Month (e.g. "Tháng 10/2026")
  const dateGroups = useMemo<ReleaseDateGroup[]>(() => {
    const groupsMap = new Map<string, ReleaseScheduleItem[]>();

    filteredItems.forEach((item) => {
      const monthKey = item.releaseDate.slice(0, 7); // "YYYY-MM"
      if (!groupsMap.has(monthKey)) {
        groupsMap.set(monthKey, []);
      }
      groupsMap.get(monthKey)!.push(item);
    });

    const result: ReleaseDateGroup[] = [];
    groupsMap.forEach((items, monthKey) => {
      const [year, month] = monthKey.split('-');
      const dateLabel = `Tháng ${month}/${year}`;
      result.push({
        dateKey: monthKey,
        dateLabel,
        isTodayOrFuture: false,
        items,
      });
    });

    return result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [filteredItems]);

  return (
    <div className={styles.schedulePage}>
      <div className={styles.container}>
        {/* Hero Header */}
        <div className={styles.heroHeader}>
          <h1 className={styles.pageTitle}>Lịch Phát Hành Truyện & Sách Bản Quyền</h1>
          <p className={styles.pageSubtitle}>
            Theo dõi tiến độ phát hành mới nhất, các đợt phát hành định kỳ và danh sách đặt trước từ các nhà xuất bản hàng đầu.
          </p>

          <div className={styles.summaryMetaBar}>
            <span className={styles.metaItem}>
              Tổng số tựa: <strong>{scheduleItems.length}</strong>
            </span>
            <span className={styles.metaDivider}>|</span>
            <span className={styles.metaItem}>
              Đang mở đặt trước: <strong>{counts.preorder}</strong>
            </span>
            <span className={styles.metaDivider}>|</span>
            <span className={styles.metaItem}>
              Mới lên kệ gần đây: <strong>{counts.recent}</strong>
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <ScheduleFilterBar
          activeType={filterType}
          onSelectType={setFilterType}
          publishers={publishers}
          selectedPublisher={selectedPublisher}
          onSelectPublisher={setSelectedPublisher}
          counts={counts}
        />

        {/* Timeline Content */}
        {loading ? (
          <div className={styles.loadingBox}>Đang tải lịch phát hành sách...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>Không có tựa sách nào phù hợp với bộ lọc đã chọn</p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setFilterType('ALL');
                setSelectedPublisher(null);
              }}
            >
              Xem lại tất cả lịch
            </button>
          </div>
        ) : (
          <div className={styles.timelineSections}>
            {dateGroups.map((group) => (
              <ScheduleTimelineGroup key={group.dateKey} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
