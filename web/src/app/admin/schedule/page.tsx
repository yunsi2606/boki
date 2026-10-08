'use client';

import { useEffect, useState, useMemo } from 'react';
import { scheduleService } from '@/services/scheduleService';
import type { CreateSchedulePayload } from '@/services/scheduleService';
import type { ReleaseScheduleItem } from '@/types/schedule';
import AdminScheduleTable from '@/components/admin/schedule/AdminScheduleTable';
import AdminScheduleFormModal from '@/components/admin/schedule/AdminScheduleFormModal';
import styles from './adminSchedule.module.css';

export default function AdminSchedulePage() {
  const [items, setItems] = useState<ReleaseScheduleItem[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('ALL');
  const [linkFilter, setLinkFilter] = useState<'ALL' | 'LINKED' | 'UNLINKED'>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReleaseScheduleItem | null>(null);

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

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mục lịch "${title}"?`)) return;

    try {
      await scheduleService.deleteSchedule(id);
      await fetchSchedules();
    } catch (err) {
      alert('Không thể xóa mục lịch. Vui lòng thử lại!');
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
        if (!matchesTitle && !matchesOrig && !matchesAuthor) return false;
      }
      if (selectedPublisher !== 'ALL' && item.publisher !== selectedPublisher) {
        return false;
      }
      if (linkFilter === 'LINKED' && !item.linkedBook && !item.bookId) return false;
      if (linkFilter === 'UNLINKED' && (item.linkedBook || item.bookId)) return false;
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
            Theo dõi kế hoạch phát hành từ các nhà xuất bản, biên soạn phụ kiện quà tặng và gắn liên kết sản phẩm trên Boki.
          </p>
        </div>
        <button type="button" className={styles.createBtn} onClick={handleOpenCreate}>
          + Thêm mục lịch mới
        </button>
      </div>

      {/* Control / Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên truyện, tên gốc, tác giả..."
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
            <option value="LINKED">Đã liên kết sách Boki</option>
            <option value="UNLINKED">Chưa liên kết sách</option>
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
          onDelete={handleDelete}
        />
      )}

      {/* Form Modal */}
      <AdminScheduleFormModal
        isOpen={isModalOpen}
        initialItem={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
