'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Trash2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Category } from '@/types';
import { categoryService } from '@/services/categoryService';
import DeleteCategoryModal from '@/components/features/admin/categories/DeleteCategoryModal';
import CategoryStatsCards from '@/components/features/admin/categories/CategoryStatsCards';
import QuickAddCategoryModal from '@/components/features/admin/books/QuickAddCategoryModal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import styles from './categories.module.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      setToast({ type: 'error', message: 'Không thể tải danh sách danh mục.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const handleDeleteConfirm = async (category: Category) => {
    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setToast({
        type: 'success',
        message: `Đã xóa danh mục "${category.name}". Các sách liên quan vẫn được giữ nguyên an toàn.`,
      });
      setDeletingCategory(null);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err?.message || 'Có lỗi xảy ra khi xóa danh mục.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategoryCreated = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    setToast({ type: 'success', message: `Đã thêm thành công danh mục "${newCat.name}".` });
  };

  const getParentName = (parentId: number | null | undefined) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : `#${parentId}`;
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản Lý Danh Mục Sách</h1>
          <p className={styles.subtitle}>
            Xem, thêm mới hoặc xóa danh mục mà không làm ảnh hưởng đến dữ liệu sách.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className={styles.addBtn}
        >
          <Plus size={18} />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* System Safety Guarantee Banner */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ color: '#059669', flexShrink: 0 }}>
          <ShieldCheck size={20} />
        </div>
        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
          <strong style={{ color: '#0f172a' }}>Cơ chế xóa danh mục an toàn:</strong> Khi xóa một danh mục, hệ thống sẽ gỡ thể loại đó khỏi các sách liên quan và xóa danh mục khỏi cơ sở dữ liệu. Toàn bộ sách thuộc danh mục đó <strong>tuyệt đối không bị xóa</strong>.
        </div>
      </div>

      {/* Stats Cards */}
      <CategoryStatsCards categories={categories} />

      {/* Search and Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Hiển thị <strong>{filteredCategories.length}</strong> danh mục
        </div>
      </div>

      {/* Category Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '24px' }}>
            <TableSkeleton rows={6} />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className={styles.emptyState}>
            Không tìm thấy danh mục nào phù hợp với từ khóa tìm kiếm.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: '80px' }}>ID</th>
                <th className={styles.th}>Tên danh mục</th>
                <th className={styles.th} style={{ width: '200px' }}>Phân cấp</th>
                <th className={styles.th}>Mô tả</th>
                <th className={styles.th} style={{ width: '130px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => {
                const parentName = getParentName(cat.parentId);
                return (
                  <tr key={cat.id} className={styles.tr}>
                    <td className={styles.td}>
                      <span className={styles.idBadge}>#{cat.id}</span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.nameWrap}>
                        <span className={styles.name}>{cat.name}</span>
                        <span className={styles.slug}>/{cat.slug}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      {parentName ? (
                        <span className={styles.parentBadge}>
                          Con của: {parentName}
                        </span>
                      ) : (
                        <span className={styles.rootBadge}>Danh mục gốc</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.desc} title={cat.description || ''}>
                        {cat.description || <span style={{ color: '#94a3b8' }}>Chưa có mô tả</span>}
                      </div>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(cat)}
                        className={styles.deleteBtn}
                        title={`Xóa danh mục ${cat.name}`}
                      >
                        <Trash2 size={15} />
                        <span>Xóa</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={Boolean(deletingCategory)}
        category={deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Quick Add Category Modal */}
      <QuickAddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingCategories={categories}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}
