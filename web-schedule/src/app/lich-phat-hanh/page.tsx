'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem, ScheduleTimelineGroup as GroupType } from '@/types/schedule';
import { ScheduleFilterBar } from '@/components/features/schedule/ScheduleFilterBar';
import { ScheduleCalendarMatrix } from '@/components/features/schedule/ScheduleCalendarMatrix';
import { ScheduleTimelineGroup } from '@/components/features/schedule/ScheduleTimelineGroup';
import { FloatingScheduleNav } from '@/components/features/schedule/FloatingScheduleNav';
import { TimelineGroupSkeleton } from '@/components/features/schedule/ScheduleSkeleton';
import styles from './lichPhatHanh.module.css';

export default function FullSchedulePage() {
  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'CALENDAR'>('TIMELINE');
  const hasAutoScrolled = useRef<boolean>(false);

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
    setVisibleCount(12);
    hasAutoScrolled.current = true; // don't auto scroll when switching months
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setVisibleCount(12);
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
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    setTimeout(() => {
      const el = document.getElementById(`date-${dateStr}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSelectDateFromCalendar = (dateStr: string) => {
    setViewMode('TIMELINE');
    setVisibleCount(999);
    setTimeout(() => {
      const el = document.getElementById(`date-${dateStr}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Filter strictly by the selected month & year, and sort ASCENDING (day 1 -> end of month)
  const timelineGroups = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const query = searchQuery.trim().toLowerCase();

    const filtered = schedules.filter((s) => {
      if (!s.releaseDate || !s.releaseDate.startsWith(monthPrefix)) return false;
      if (selectedPublisher !== 'ALL' && s.publisher !== selectedPublisher) return false;
      if (query && !s.title.toLowerCase().includes(query) && !s.author?.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });

    const map = new Map<string, GroupType>();
    filtered.forEach((schedule) => {
      const dateKey = schedule.releaseDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, {
          dateKey,
          dateLabel: `Ngày phát hành: ${dateKey}`,
          items: [],
        });
      }
      map.get(dateKey)!.items.push({
        schedule,
        eventType: 'RELEASE',
        targetEditionIdx: 0,
        eventDate: dateKey,
      });
    });

    // Ascending sort: day 1 to last day of the month
    return Array.from(map.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [schedules, currentYear, currentMonth, selectedPublisher, searchQuery]);

  // Auto-scroll to today if viewing current month on initial load
  useEffect(() => {
    if (loading || hasAutoScrolled.current || timelineGroups.length === 0) return;
    const isThisMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;
    if (!isThisMonth) return;

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    // Find today or the closest upcoming date
    const targetIdx = timelineGroups.findIndex((g) => g.dateKey >= todayStr);
    if (targetIdx !== -1) {
      if (targetIdx >= visibleCount) {
        setVisibleCount(targetIdx + 6);
      }
      hasAutoScrolled.current = true;
      const targetKey = timelineGroups[targetIdx].dateKey;
      setTimeout(() => {
        const el = document.getElementById(`date-${targetKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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

          {/* Lazy load more button */}
          {visibleCount < timelineGroups.length && (
            <div style={{ textAlign: 'center', margin: '24px 0 40px' }}>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className={styles.viewModeToggle}
              >
                Tải thêm ngày phát hành ({timelineGroups.length - visibleCount} ngày còn lại)
              </button>
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
