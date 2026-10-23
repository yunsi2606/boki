'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { scheduleService, type CreateSchedulePayload } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import AdminScheduleTable from '@/components/admin/schedule/AdminScheduleTable';
import AdminScheduleFormModal from '@/components/admin/schedule/AdminScheduleFormModal';
import AdminScheduleOcrModal from '@/components/admin/schedule/AdminScheduleOcrModal';
import DeleteScheduleModal from '@/components/admin/schedule/DeleteScheduleModal';
import AdminScheduleFilterBar from '@/components/admin/schedule/AdminScheduleFilterBar';
import {
  getAvailablePeriods,
  getPrevPeriod,
  getNextPeriod,
  matchesSchedulePeriod,
} from '@/components/admin/schedule/schedulePeriodHelper';
import { createNextVolumeItem } from '@/components/admin/schedule/scheduleCloneHelper';
import styles from './adminSchedule.module.css';

export default function AdminSchedulePage() {
  const [items, setItems] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [linkFilter, setLinkFilter] = useState<'ALL' | 'LINKED' | 'UNLINKED'>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReleaseScheduleItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ReleaseScheduleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const [scheduleData, pubData] = await Promise.all([
        scheduleService.getSchedules(),
        scheduleService.getPublishers(),
      ]);
      setItems(scheduleData || []);
      setPublishers(pubData || []);
    } catch (err) {
      console.error('Failed to load admin schedules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const availablePeriods = useMemo(() => getAvailablePeriods(items), [items]);

  const handlePrevPeriod = () => {
    setSelectedPeriod((prev) => getPrevPeriod(prev));
  };

  const handleNextPeriod = () => {
    setSelectedPeriod((prev) => getNextPeriod(prev));
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ReleaseScheduleItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenAddNextVolume = (item: ReleaseScheduleItem) => {
    setEditingItem(createNextVolumeItem(item));
    setIsModalOpen(true);
  };

  const handleRequestDelete = (item: ReleaseScheduleItem) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await scheduleService.deleteSchedule(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setDeletingItem(null);
      await fetchSchedules();
    } catch (err) {
      console.error('Failed to delete schedule item:', err);
      alert('Không thể xóa mục lịch. Vui lòng thử lại!');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSyncSeries = async () => {
    if (!window.confirm('Chuẩn hóa và đồng bộ toàn bộ lịch phát hành theo Series và số Tập (Volume)?')) {
      return;
    }
    try {
      setIsSyncing(true);
      const res = await scheduleService.syncSeries();
      alert(res.message || 'Đồng bộ thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Failed to sync series:', err);
      alert('Không thể đồng bộ series. Vui lòng thử lại!');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmitForm = async (payload: CreateSchedulePayload) => {
    if (editingItem?.id) {
      await scheduleService.updateSchedule(editingItem.id, payload);
    } else {
      await scheduleService.createSchedule(payload);
    }
    await fetchSchedules();
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!matchesSchedulePeriod(item, selectedPeriod)) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(term);
        const matchesOrig = item.originalTitle?.toLowerCase().includes(term);
        const matchesAuthor = item.author?.toLowerCase().includes(term);
        const matchesEditions = item.editions?.some((e) =>
          e.editionName.toLowerCase().includes(term) || (e.gifts && e.gifts.toLowerCase().includes(term))
        );
        if (!matchesTitle && !matchesOrig && !matchesAuthor && !matchesEditions) return false;
      }
      if (selectedPublisher !== 'ALL' && item.publisher !== selectedPublisher && item.imprint !== selectedPublisher) {
        return false;
      }
      const hasAnyLinked = item.editions?.some((e) => e.linkedBook || e.bookId);
      if (linkFilter === 'LINKED' && !hasAnyLinked) return false;
      if (linkFilter === 'UNLINKED' && hasAnyLinked) return false;
      return true;
    });
  }, [items, selectedPeriod, searchTerm, selectedPublisher, linkFilter]);

  return (
    <div className={styles.adminSchedulePage}>
      {/* Top Header */}
      <div className={styles.topHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quản Lý Lịch Phát Hành Sách & Manga</h1>
          <p className={styles.pageSubtitle}>
            Quản lý kế hoạch xuất bản (1 Đầu sách - N Phiên bản), phân bổ quà tặng độc quyền và liên kết sản phẩm trên Boki.
          </p>
        </div>
        <div className={styles.headerActionGroup}>
          <button type="button" className={styles.syncBtn} onClick={handleSyncSeries} disabled={isSyncing}>
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Series'}
          </button>
          <Link href="/admin/schedule/email" className={styles.syncBtn} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Email thông báo
          </Link>
          <Link href="/admin/schedule/giveaway" className={styles.syncBtn} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Give Away Manga
          </Link>
          <button type="button" className={styles.ocrBtn} onClick={() => setIsOcrModalOpen(true)}>
            Quét ảnh lịch (AI)
          </button>
          <button type="button" className={styles.createBtn} onClick={handleOpenCreate}>
            + Thêm mục lịch mới
          </button>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <AdminScheduleFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        availablePeriods={availablePeriods}
        onPrevPeriod={handlePrevPeriod}
        onNextPeriod={handleNextPeriod}
        selectedPublisher={selectedPublisher}
        onSelectPublisher={setSelectedPublisher}
        publishers={publishers}
        linkFilter={linkFilter}
        onSelectLinkFilter={setLinkFilter}
      />

      {/* Table Content */}
      {loading ? (
        <div className={styles.loadingBox}>Đang tải danh sách lịch phát hành...</div>
      ) : (
        <AdminScheduleTable
          items={filteredItems}
          onEdit={handleOpenEdit}
          onDelete={handleRequestDelete}
          onAddNextVolume={handleOpenAddNextVolume}
        />
      )}

      {/* Form Modal */}
      <AdminScheduleFormModal
        isOpen={isModalOpen}
        initialItem={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
      />

      {/* OCR Staging Modal */}
      <AdminScheduleOcrModal
        isOpen={isOcrModalOpen}
        publishers={publishers}
        onClose={() => setIsOcrModalOpen(false)}
        onSuccess={fetchSchedules}
      />

      {/* Delete Confirmation Modal */}
      <DeleteScheduleModal
        isOpen={!!deletingItem}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
