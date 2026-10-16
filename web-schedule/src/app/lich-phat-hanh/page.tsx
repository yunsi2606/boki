'use client';

import { useEffect, useState, useMemo } from 'react';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem, ScheduleTimelineGroup as GroupType } from '@/types/schedule';
import { ScheduleFilterBar } from '@/components/features/schedule/ScheduleFilterBar';
import { ScheduleCalendarMatrix } from '@/components/features/schedule/ScheduleCalendarMatrix';
import { ScheduleTimelineGroup } from '@/components/features/schedule/ScheduleTimelineGroup';
import { FloatingScheduleNav } from '@/components/features/schedule/FloatingScheduleNav';
import styles from './lichPhatHanh.module.css';

export default function FullSchedulePage() {
  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'CALENDAR'>('TIMELINE');

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
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
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
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    const el = document.getElementById(`date-${dateStr}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectDateFromCalendar = (dateStr: string) => {
    setViewMode('TIMELINE');
    setTimeout(() => {
      const el = document.getElementById(`date-${dateStr}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const timelineGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = schedules.filter((s) => {
      if (selectedPublisher !== 'ALL' && s.publisher !== selectedPublisher) return false;
      if (query && !s.title.toLowerCase().includes(query) && !s.author?.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });

    const map = new Map<string, GroupType>();
    filtered.forEach((schedule) => {
      const dateKey = schedule.releaseDate || 'Đang cập nhật';
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

    return Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [schedules, selectedPublisher, searchQuery]);

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
              {viewMode === 'CALENDAR' ? 'Chuyển xem Dòng thời gian →' : 'Chuyển xem Lưới Tháng →'}
            </button>
          </div>
          <div className={styles.countBadge}>{schedules.length} TẬP TRUYỆN ĐÃ LÊN LỊCH</div>
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
        <div className={styles.emptyBox}>Đang tải dữ liệu lịch phát hành...</div>
      ) : viewMode === 'CALENDAR' ? (
        <ScheduleCalendarMatrix
          year={currentYear}
          month={currentMonth}
          schedules={schedules}
          onSelectDate={handleSelectDateFromCalendar}
        />
      ) : timelineGroups.length === 0 ? (
        <div className={styles.emptyBox}>Không có đầu sách nào phù hợp với bộ lọc.</div>
      ) : (
        timelineGroups.map((group) => (
          <ScheduleTimelineGroup key={group.dateKey} group={group} />
        ))
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
