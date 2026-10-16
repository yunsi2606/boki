'use client';

import { useEffect, useState, useMemo } from 'react';
import { scheduleService } from '@/services/scheduleService';
import type { ReleaseScheduleItem, ScheduleTimelineGroup as GroupType } from '@/types/schedule';
import { ScheduleFilterBar } from '@/components/features/schedule/ScheduleFilterBar';
import { ScheduleTimelineGroup } from '@/components/features/schedule/ScheduleTimelineGroup';
import styles from './home.module.css';

export default function ScheduleHomePage() {
  const [schedules, setSchedules] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

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
        console.error('Failed to load release schedules', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const timelineGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = schedules.filter((s) => {
      if (selectedPublisher !== 'ALL' && s.publisher !== selectedPublisher) return false;
      if (query && !s.title.toLowerCase().includes(query) && !s.author?.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });

    // Group by date - Volume-centric (1 card per volume on that date)
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
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Lịch Phát Hành Manga & Sách Toàn Quốc</h1>
        <p className={styles.heroSubtitle}>
          Tra cứu lịch xuất bản chính thức từ các NXB Kim Đồng, Trẻ, IPM, Wings Books... So sánh giá và mua trực tiếp qua Boki Store, Shopee, TikTok Shop.
        </p>
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
      ) : timelineGroups.length === 0 ? (
        <div className={styles.emptyBox}>Không có đầu sách nào phù hợp với bộ lọc.</div>
      ) : (
        timelineGroups.map((group) => (
          <ScheduleTimelineGroup key={group.dateKey} group={group} />
        ))
      )}
    </main>
  );
}
