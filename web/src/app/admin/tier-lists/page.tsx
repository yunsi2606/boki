'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { MangaTierListSummary } from '@/types/tierList';
import { adminTierListService } from '@/services/adminTierListService';
import TierListTable from '@/components/admin/tier-lists/TierListTable';
import TierListFormModal from '@/components/admin/tier-lists/TierListFormModal';
import DeleteTierListModal from '@/components/admin/tier-lists/DeleteTierListModal';
import { Plus, Search, RefreshCw } from 'lucide-react';
import styles from './adminTierLists.module.css';

export default function AdminTierListsPage() {
  const [items, setItems] = useState<MangaTierListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MangaTierListSummary | null>(null);
  const [deletingItem, setDeletingItem] = useState<MangaTierListSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminTierListService.getTierLists(searchTerm);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load admin tier lists:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: MangaTierListSummary) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: MangaTierListSummary) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await adminTierListService.deleteTierList(deletingItem.id);
      setDeletingItem(null);
      await fetchItems();
    } catch (err) {
      console.error('Failed to delete tier list:', err);
      alert('Không thể xóa danh sách tuyển chọn. Vui lòng thử lại!');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublic = async (id: string) => {
    try {
      const res = await adminTierListService.togglePublic(id);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isPublic: res.isPublic } : i))
      );
    } catch (err) {
      console.error('Failed to toggle public status:', err);
      alert('Không thể cập nhật trạng thái công khai!');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản Lý Tuyển Chọn (Manga Tier List)</h1>
          <p className={styles.subtitle}>
            Quản trị các danh sách tuyển chọn hiển thị ở thanh bên phải của web lịch phát hành
          </p>
        </div>

        <button type="button" onClick={handleOpenCreate} className={styles.createBtn}>
          <Plus size={16} />
          <span>Tạo danh sách mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề danh sách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          type="button"
          onClick={() => fetchItems()}
          className={styles.refreshBtn}
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Main Table */}
      <TierListTable
        items={items}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onTogglePublic={handleTogglePublic}
      />

      {/* Modals */}
      <TierListFormModal
        isOpen={isFormOpen}
        editingItem={editingItem}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchItems}
      />

      <DeleteTierListModal
        isOpen={Boolean(deletingItem)}
        item={deletingItem}
        isDeleting={isDeleting}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
