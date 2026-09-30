'use client';

import React from 'react';
import { Plus, X, Tag } from 'lucide-react';
import styles from './MultiCategorySelector.module.css';

interface CategoryItem {
  id: number;
  name: string;
}

interface MultiCategorySelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  categories: CategoryItem[];
  onOpenCreateModal: () => void;
}

export const MultiCategorySelector: React.FC<MultiCategorySelectorProps> = ({
  selectedIds,
  onChange,
  categories,
  onOpenCreateModal,
}) => {
  const handleAdd = (categoryId: number) => {
    if (!selectedIds.includes(categoryId)) {
      onChange([...selectedIds, categoryId]);
    }
  };

  const handleRemove = (categoryId: number) => {
    // Keep at least one or allow empty if form validation checks
    onChange(selectedIds.filter((id) => id !== categoryId));
  };

  const getCategoryName = (id: number) => {
    const found = categories.find((c) => c.id === id);
    return found ? found.name : `Danh mục #${id}`;
  };

  const unselectedCategories = categories.filter((c) => !selectedIds.includes(c.id));

  return (
    <div className={styles.container}>
      <div className={styles.selectedPills}>
        {selectedIds.length === 0 ? (
          <span className={styles.emptyPills}>Chưa chọn danh mục nào (Vui lòng chọn ít nhất 1)</span>
        ) : (
          selectedIds.map((id) => (
            <span key={id} className={styles.pill}>
              <Tag size={12} />
              <span>{getCategoryName(id)}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemove(id)}
                title="Bỏ danh mục"
              >
                <X size={13} />
              </button>
            </span>
          ))
        )}
      </div>

      <div className={styles.dropdownWrapper}>
        <select
          value=""
          onChange={(e) => {
            const val = e.target.value;
            if (val === '__add_new__') {
              onOpenCreateModal();
            } else if (val) {
              handleAdd(parseInt(val, 10));
            }
          }}
          className={styles.categorySelect}
        >
          <option value="" disabled>
            + Chọn thêm danh mục cho sách...
          </option>
          {unselectedCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="__add_new__" style={{ fontWeight: 600, color: '#2563eb' }}>
            + Thêm danh mục mới vào hệ thống...
          </option>
        </select>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className={styles.addCategoryBtn}
        >
          <Plus size={14} />
          <span>Tạo danh mục</span>
        </button>
      </div>
    </div>
  );
};
