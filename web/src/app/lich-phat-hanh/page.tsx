'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
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
import SchedulePastSection from '@/components/features/schedule/SchedulePastSection';
import ScheduleDetailModal from '@/components/features/schedule/ScheduleDetailModal';
import styles from './lichPhatHanh.module.css';

export default function LichPhatHanhPage() {
  const [items, setItems] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('DAY');
  const [activeTab, setActiveTab] = useState<ScheduleTabFilter>('ALL');
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<ReleaseScheduleItem | null>(null);
  const [detailEditionIdx, setDetailEditionIdx] = useState<number>(0);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    scheduleService
      .getPublishers()
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

  const { pastGroups, upcomingGroups, isAllPast } = useMemo(() => {
    const past: GroupType[] = [];
    const upcoming: GroupType[] = [];
    const currentMonthKey = todayStr.slice(0, 7);

    dateGroups.forEach((g) => {
      const isPast =
        g.dateKey.length === 10
          ? g.dateKey < todayStr
          : g.dateKey < currentMonthKey;

      if (isPast) {
        past.push(g);
      } else {
        upcoming.push(g);
      }
    });

    return { pastGroups: past, upcomingGroups: upcoming, isAllPast: upcoming.length === 0 };
  }, [dateGroups, todayStr]);

  const { visibleGroups, hasMore, sentinelRef } = useScheduleLazyGroups(upcomingGroups);

  const handleOpenDetail = (item: ReleaseScheduleItem, editionIdx = 0) => {
    setDetailItem(item);
    setDetailEditionIdx(editionIdx);
  };

  return (
    <main className={styles.container}>
      {/* Header Banner with Sub-Navigation */}
      <div className={styles.headerBanner}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.mainTitle}>
              Boki <span className={styles.mainTitleHighlight}>- Lịch Phát Hành</span>
            </h1>
            <p className={styles.subtitle}>
              Cập nhật lịch xuất bản Manga, Comic & Light Novel bản quyền mới nhất tại Việt Nam
            </p>
          </div>
        </div>

        {/* Vietnamese Sub-navigation Pills */}
        <div className={styles.navPillsRow}>
          <Link href="/lich-phat-hanh" className={`${styles.navPill} ${styles.navPillActive}`}>
            Lịch phát hành
          </Link>
          <Link href="/tu-sach" className={styles.navPill}>
            Tủ sách của tôi
          </Link>
          <Link href="/lich-su-thay-doi" className={styles.navPill}>
            Lịch sử dời lịch
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <ScheduleFilterBar
        publishers={publishers}
        selectedPublisher={selectedPublisher}
        onSelectPublisher={setSelectedPublisher}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={counts}
      />

      {/* Content Area */}
      {loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <span>Đang tải lịch phát hành...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.emptyBox}>
          <h3 className={styles.emptyTitle}>Chưa có lịch phát hành phù hợp</h3>
          <p className={styles.emptyText}>
            Vui lòng thử chọn tháng khác hoặc thay đổi bộ lọc nhà xuất bản.
          </p>
        </div>
      ) : (
        <div className={styles.timelineWrap}>
          {isAllPast ? (
            <div className={styles.timelineWrap}>
              {pastGroups.map((group) => (
                <ScheduleTimelineGroup
                  key={group.dateKey}
                  group={group}
                  onOpenDetail={handleOpenDetail}
                />
              ))}
            </div>
          ) : (
            <>
              {visibleGroups.map((group) => (
                <ScheduleTimelineGroup
                  key={group.dateKey}
                  group={group}
                  onOpenDetail={handleOpenDetail}
                />
              ))}

              {hasMore && <div ref={sentinelRef} style={{ height: 20 }} />}

              <SchedulePastSection
                pastGroups={pastGroups}
                isAllPast={isAllPast}
                onOpenDetail={handleOpenDetail}
              />
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <ScheduleDetailModal
          item={detailItem}
          initialEditionIdx={detailEditionIdx}
          onClose={() => setDetailItem(null)}
        />
      )}
    </main>
  );
}
