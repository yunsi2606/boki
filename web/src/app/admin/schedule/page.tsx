'use client';

import { useEffect, useState, useMemo } from 'react';
import { scheduleService } from '@/services/scheduleService';
import type { CreateSchedulePayload } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import AdminScheduleTable from '@/components/admin/schedule/AdminScheduleTable';
import AdminScheduleFormModal from '@/components/admin/schedule/AdminScheduleFormModal';
import AdminScheduleOcrModal from '@/components/admin/schedule/AdminScheduleOcrModal';
import DeleteScheduleModal from '@/components/admin/schedule/DeleteScheduleModal';
import styles from './adminSchedule.module.css';

export default function AdminSchedulePage() {
  const [items, setItems] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [linkFilter, setLinkFilter] = useState<'ALL' | 'LINKED' | 'UNLINKED'>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReleaseScheduleItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ReleaseScheduleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ReleaseScheduleItem) => {
    setEditingItem(item);
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

  const handleSubmitForm = async (payload: CreateSchedulePayload) => {
    if (editingItem) {
      await scheduleService.updateSchedule(editingItem.id, payload);
    } else {
      await scheduleService.createSchedule(payload);
    }
    await fetchSchedules();
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
      if (selectedPublisher !== 'ALL' && item.publisher !== selectedPublisher) {
        return false;
      }
      const hasAnyLinked = item.editions?.some((e) => e.linkedBook || e.bookId);
      if (linkFilter === 'LINKED' && !hasAnyLinked) return false;
      if (linkFilter === 'UNLINKED' && hasAnyLinked) return false;
      return true;
    });
  }, [items, searchTerm, selectedPublisher, linkFilter]);

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
          <button
            type="button"
            className={styles.ocrBtn}
            onClick={() => setIsOcrModalOpen(true)}
          >
            Quét ảnh lịch (AI)
          </button>
          <button type="button" className={styles.createBtn} onClick={handleOpenCreate}>
            + Thêm mục lịch mới
          </button>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên truyện, tên gốc, tác giả, quà tặng..."
          />
        </div>

        <div className={styles.selectGroup}>
          <select
            value={selectedPublisher}
            onChange={(e) => setSelectedPublisher(e.target.value)}
          >
            <option value="ALL">Tất cả nhà xuất bản</option>
            {publishers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={linkFilter}
            onChange={(e) => setLinkFilter(e.target.value as 'ALL' | 'LINKED' | 'UNLINKED')}
          >
            <option value="ALL">Tất cả tình trạng link</option>
            <option value="LINKED">Đã có bản link sách Boki</option>
            <option value="UNLINKED">Chưa có bản nào link</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className={styles.loadingBox}>Đang tải danh sách lịch phát hành...</div>
      ) : (
        <AdminScheduleTable
          items={filteredItems}
          onEdit={handleOpenEdit}
          onDelete={handleRequestDelete}
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
