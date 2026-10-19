'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import { ScheduleFilterBar } from '@/components/features/schedule/ScheduleFilterBar';
import { ScheduleCalendarMatrix } from '@/components/features/schedule/ScheduleCalendarMatrix';
import { ScheduleTimelineGroup } from '@/components/features/schedule/ScheduleTimelineGroup';
import { FloatingScheduleNav } from '@/components/features/schedule/FloatingScheduleNav';
import { TimelineGroupSkeleton } from '@/components/features/schedule/ScheduleSkeleton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { buildTimelineGroups } from '@/components/features/schedule/scheduleTimelineHelper';
import styles from './lichPhatHanh.module.css';

export default function FullSchedulePage() {
  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'CALENDAR'>('TIMELINE');
  const hasAutoScrolled = useRef<boolean>(false);
  const loadTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const [items, pubs] = await Promise.all([
          scheduleService.getSchedules(),
          scheduleService.getPublishers().catch(() => ['Kim Đồng', 'NXB Trẻ', 'IPM']),
        ]);
        setSchedules(items || []);
        setPublishers(pubs || []);
      } catch (err) {
        console.error('Failed to load full release schedules', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const handlePrevMonth = () => {
    setVisibleCount(10);
    setIsLoadingMore(false);
    hasAutoScrolled.current = true;
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setVisibleCount(10);
    setIsLoadingMore(false);
    hasAutoScrolled.current = true;
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setVisibleCount(999);
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setTimeout(() => {
      const el = document.getElementById(`date-${dateStr}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSelectDateFromCalendar = (dateStr: string) => {
    setViewMode('TIMELINE');
    setVisibleCount(999);
    setTimeout(() => {
      const el = document.getElementById(`date-${dateStr}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const timelineGroups = useMemo(() => {
    return buildTimelineGroups(schedules, currentYear, currentMonth, selectedPublisher, searchQuery);
  }, [schedules, currentYear, currentMonth, selectedPublisher, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || loading || visibleCount >= timelineGroups.length) return;
    setIsLoadingMore(true);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = setTimeout(() => {
      setVisibleCount((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 450);
  }, [isLoadingMore, loading, visibleCount, timelineGroups.length]);

  const sentinelRef = useIntersectionObserver({
    onIntersect: handleLoadMore,
    enabled: viewMode === 'TIMELINE' && !loading && visibleCount < timelineGroups.length,
    rootMargin: '60px',
  });

  useEffect(() => {
    if (loading || hasAutoScrolled.current || timelineGroups.length === 0) return;
    const isThisMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;
    if (!isThisMonth) return;

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const targetIdx = timelineGroups.findIndex((g) => g.dateKey >= todayStr);
    if (targetIdx !== -1) {
      if (targetIdx >= visibleCount) setVisibleCount(targetIdx + 6);
      hasAutoScrolled.current = true;
      const targetKey = timelineGroups[targetIdx].dateKey;
      setTimeout(() => {
        const el = document.getElementById(`date-${targetKey}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
  }, [loading, timelineGroups, currentYear, currentMonth, visibleCount, now]);

  const displayedGroups = timelineGroups.slice(0, visibleCount);

  return (
    <main className={styles.container}>
      <div className={styles.scheduleTopBar}>
        <div>
          <div className={styles.topRow}>
            <h1 className={styles.scheduleTitle}>Lịch Phát Hành Sách & Manga</h1>
            <button
              type="button"
              className={styles.viewModeToggle}
              onClick={() => setViewMode(viewMode === 'CALENDAR' ? 'TIMELINE' : 'CALENDAR')}
            >
              {viewMode === 'CALENDAR' ? 'Chuyển xem Dòng thời gian' : 'Chuyển xem Lưới Tháng'}
            </button>
          </div>
          <div className={styles.countBadge}>
            THÁNG {String(currentMonth).padStart(2, '0')}/{currentYear} — {timelineGroups.reduce((acc, g) => acc + g.items.length, 0)} ẤN BẢN
          </div>
        </div>

        <div className={styles.monthSelector}>
          <button type="button" className={styles.arrowBtn} onClick={handlePrevMonth} title="Tháng trước">
            &lt;
          </button>
          <span className={styles.monthDisplay}>
            {String(currentMonth).padStart(2, '0')}/{String(currentYear).slice(-2)}
          </span>
          <button type="button" className={styles.arrowBtn} onClick={handleNextMonth} title="Tháng sau">
            &gt;
          </button>
        </div>
      </div>

      <ScheduleFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPublisher={selectedPublisher}
        onSelectPublisher={setSelectedPublisher}
        publishers={publishers}
      />

      {loading ? (
        <TimelineGroupSkeleton count={3} />
      ) : viewMode === 'CALENDAR' ? (
        <ScheduleCalendarMatrix
          year={currentYear}
          month={currentMonth}
          schedules={schedules}
          onSelectDate={handleSelectDateFromCalendar}
        />
      ) : timelineGroups.length === 0 ? (
        <div className={styles.emptyBox}>Không có đầu sách nào phát hành trong tháng {currentMonth}/{currentYear}.</div>
      ) : (
        <>
          {displayedGroups.map((group) => (
            <ScheduleTimelineGroup key={group.dateKey} group={group} />
          ))}

          {/* Infinite Scroll Sentinel with visible shimmer animation */}
          {visibleCount < timelineGroups.length && (
            <div ref={sentinelRef} className={styles.sentinelBox}>
              {isLoadingMore && <TimelineGroupSkeleton count={1} />}
            </div>
          )}

          {/* End of list notice */}
          {!loading && timelineGroups.length > 0 && visibleCount >= timelineGroups.length && (
            <div className={styles.endNotice}>
              Đã hiển thị toàn bộ {timelineGroups.reduce((acc, g) => acc + g.items.length, 0)} ấn bản phát hành trong tháng {String(currentMonth).padStart(2, '0')}/{currentYear}
            </div>
          )}
        </>
      )}

      <FloatingScheduleNav
        month={currentMonth}
        year={currentYear}
        viewMode={viewMode}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToggleView={() => setViewMode(viewMode === 'CALENDAR' ? 'TIMELINE' : 'CALENDAR')}
        onJumpToday={handleJumpToday}
      />
    </main>
  );
}
