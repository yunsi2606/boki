'use client';

import { useEffect, useState, useMemo } from 'react';
import { scheduleService } from '@/services/scheduleService';
import type {
  ReleaseScheduleItem,
  ScheduleTabFilter,
  ScheduleViewMode,
  ScheduleTimelineGroup as GroupType,
} from '@/types/schedule';
import { groupSchedulesByDay, groupSchedulesByMonth } from '@/utils/scheduleDateGroups';
import { useScheduleLazyGroups } from '@/hooks/useScheduleLazyGroups';
import ScheduleFilterBar from '@/components/features/schedule/ScheduleFilterBar';
import ScheduleTimelineGroup from '@/components/features/schedule/ScheduleTimelineGroup';
import ScheduleDetailModal from '@/components/features/schedule/ScheduleDetailModal';
import styles from './schedule.module.css';

export default function ReleaseSchedulePage() {
  const [items, setItems] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('DAY');
  const [activeTab, setActiveTab] = useState<ScheduleTabFilter>('ALL');
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<ReleaseScheduleItem | null>(null);
  const [detailEditionIdx, setDetailEditionIdx] = useState<number>(0);

  useEffect(() => {
    scheduleService.getPublishers()
      .then((data) => setPublishers(data || []))
      .catch((err) => console.error('Failed to load publishers', err));
  }, []);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        setLoading(true);
        const data = await scheduleService.getSchedules({
          month: selectedMonth ?? undefined,
          year: selectedMonth ? 2026 : undefined,
          publisher: selectedPublisher ?? undefined,
        });
        setItems(data || []);
      } catch (err) {
        console.error('Failed to load release schedules', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
  }, [selectedMonth, selectedPublisher]);

  const counts = useMemo(() => {
    const linked = items.filter((i) =>
      i.editions?.some((e) => Boolean(e.linkedBook || e.bookId))
    ).length;
    const special = items.filter((i) =>
      i.editions?.some((e) => e.editionType && e.editionType !== 'STANDARD')
    ).length;
    return { all: items.length, linked, special };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'LINKED') {
        return item.editions?.some((e) => Boolean(e.linkedBook || e.bookId));
      }
      if (activeTab === 'SPECIAL') {
        return item.editions?.some((e) => e.editionType && e.editionType !== 'STANDARD');
      }
      return true;
    });
  }, [items, activeTab]);

  const dateGroups = useMemo<GroupType[]>(() => {
    if (viewMode === 'DAY') {
      return groupSchedulesByDay(filteredItems);
    }
    return groupSchedulesByMonth(filteredItems);
  }, [filteredItems, viewMode]);

  const { visibleGroups, hasMore, sentinelRef } = useScheduleLazyGroups(dateGroups, {
    batchSize: 4,
    initialCount: 5,
    resetDeps: [viewMode, activeTab, selectedPublisher, selectedMonth],
  });

  const handleOpenDetail = (item: ReleaseScheduleItem, editionIdx?: number) => {
    setDetailItem(item);
    setDetailEditionIdx(editionIdx || 0);
  };

  return (
    <div className={styles.schedulePage}>
      <div className={styles.container}>
        <div className={styles.heroHeader}>
          <h1 className={styles.pageTitle}>Lịch Phát Hành Manga & Sách Xuất Bản</h1>
          <p className={styles.pageSubtitle}>
            Cập nhật chi tiết lịch xuất bản từ các nhà phát hành hàng đầu (Kim Đồng, IPM, NXB Trẻ...).
            Theo dõi quà tặng, ấn bản giới hạn và truy cập trực tiếp sản phẩm trên Boki.
          </p>

          <div className={styles.summaryMetaBar}>
            <span className={styles.metaItem}>
              Tổng số tác phẩm: <strong>{items.length}</strong>
            </span>
            <span className={styles.metaDivider}>|</span>
            <span className={styles.metaItem}>
              Đã có link trên Boki: <strong>{counts.linked}</strong>
            </span>
            <span className={styles.metaDivider}>|</span>
            <span className={styles.metaItem}>
              Bản đặc biệt & Boxset: <strong>{counts.special}</strong>
            </span>
          </div>
        </div>

        <ScheduleFilterBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          publishers={publishers}
          selectedPublisher={selectedPublisher}
          onSelectPublisher={setSelectedPublisher}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          counts={counts}
        />

        {loading ? (
          <div className={styles.loadingBox}>Đang tải dữ liệu lịch phát hành...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>Không tìm thấy mục lịch nào trong kỳ phát hành và bộ lọc đã chọn.</p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setActiveTab('ALL');
                setSelectedPublisher(null);
                setSelectedMonth(null);
              }}
            >
              Xem lại tất cả lịch
            </button>
          </div>
        ) : (
          <div className={styles.timelineSections}>
            {visibleGroups.map((group) => (
              <ScheduleTimelineGroup
                key={group.dateKey}
                group={group}
                onOpenDetail={handleOpenDetail}
              />
            ))}

            {hasMore && (
              <div ref={sentinelRef} className={styles.lazyLoadingTrigger}>
                <div className={styles.lazyLoadingSpinner} />
                <span>
                  {viewMode === 'DAY'
                    ? 'Đang tải thêm ngày phát hành...'
                    : 'Đang tải thêm kỳ phát hành...'}
                </span>
              </div>
            )}
          </div>
        )}

        <ScheduleDetailModal
          item={detailItem}
          initialEditionIdx={detailEditionIdx}
          onClose={() => setDetailItem(null)}
        />
      </div>
    </div>
  );
}
