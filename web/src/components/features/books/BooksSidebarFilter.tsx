'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { Category } from '@/types';
import styles from '@/app/books/books.module.css';

export interface PriceRangeOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGES: PriceRangeOption[] = [
  { id: 'UNDER_50K', label: 'Dưới 50.000đ', min: 0, max: 50000 },
  { id: '50K_100K', label: '50.000đ - 100.000đ', min: 50000, max: 100000 },
  { id: '100K_200K', label: '100.000đ - 200.000đ', min: 100000, max: 200000 },
  { id: 'OVER_200K', label: 'Trên 200.000đ', min: 200000, max: Infinity },
];

export const PRODUCT_TYPES = [
  { id: 'ALL', label: 'Tất cả sản phẩm' },
  { id: 'PREORDER', label: 'Hàng đặt trước (Pre-order)' },
  { id: 'COMBO', label: 'Combo Tiết Kiệm' },
] as const;

export type ProductTypeFilter = (typeof PRODUCT_TYPES)[number]['id'];

interface BooksSidebarFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;

  suppliers: string[];
  selectedSupplier: string | null;
  onSelectSupplier: (supplier: string | null) => void;

  productType: ProductTypeFilter;
  onSelectProductType: (type: ProductTypeFilter) => void;

  priceRange: string | null;
  onSelectPriceRange: (rangeId: string | null) => void;

  onResetFilters: () => void;
  hasActiveFilters: boolean;
  isMobileDrawer?: boolean;
}

export default function BooksSidebarFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  suppliers,
  selectedSupplier,
  onSelectSupplier,
  productType,
  onSelectProductType,
  priceRange,
  onSelectPriceRange,
  onResetFilters,
  hasActiveFilters,
  isMobileDrawer = false,
}: BooksSidebarFilterProps) {
  const radioPrefix = isMobileDrawer ? 'm' : 'd';

  return (
    <aside className={`${styles.filterSidebar} ${isMobileDrawer ? styles.drawerSidebar : ''}`}>
      {!isMobileDrawer && (
        <div className={styles.filterHeaderRow}>
          <span className={styles.sidebarMainTitle}>Bộ Lọc Tìm Kiếm</span>
          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetSidebarBtn}
              onClick={onResetFilters}
              title="Xóa tất cả các bộ lọc"
            >
              <RotateCcw size={12} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      )}

      {/* Categories from DB */}
      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Thể loại sách</h3>
        <div className={styles.scrollableListCompact}>
          <label
            className={`${styles.filterLabel} ${
              selectedCategory === null ? styles.activeFilterLabel : ''
            }`}
            onClick={() => onSelectCategory(null)}
          >
            <input
              type="radio"
              name={`category-${radioPrefix}`}
              checked={selectedCategory === null}
              onChange={() => {}}
              className={styles.radioInput}
            />
            <span>Tất cả thể loại</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className={`${styles.filterLabel} ${
                selectedCategory === cat.id ? styles.activeFilterLabel : ''
              }`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <input
                type="radio"
                name={`category-${radioPrefix}`}
                checked={selectedCategory === cat.id}
                onChange={() => {}}
                className={styles.radioInput}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Product Type (Pre-order, Combo, All) */}
      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Loại sản phẩm</h3>
        <div className={styles.filterList}>
          {PRODUCT_TYPES.map((type) => (
            <label
              key={type.id}
              className={`${styles.filterLabel} ${
                productType === type.id ? styles.activeFilterLabel : ''
              }`}
              onClick={() => onSelectProductType(type.id)}
            >
              <input
                type="radio"
                name={`productType-${radioPrefix}`}
                checked={productType === type.id}
                onChange={() => {}}
                className={styles.radioInput}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Suppliers / Brands */}
      {suppliers.length > 0 && (
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Đơn vị phát hành</h3>
          <div className={styles.scrollableListCompact}>
            <label
              className={`${styles.filterLabel} ${
                selectedSupplier === null ? styles.activeFilterLabel : ''
              }`}
              onClick={() => onSelectSupplier(null)}
            >
              <input
                type="radio"
                name={`supplier-${radioPrefix}`}
                checked={selectedSupplier === null}
                onChange={() => {}}
                className={styles.radioInput}
              />
              <span>Tất cả đơn vị</span>
            </label>
            {suppliers.map((sup) => (
              <label
                key={sup}
                className={`${styles.filterLabel} ${
                  selectedSupplier === sup ? styles.activeFilterLabel : ''
                }`}
                onClick={() => onSelectSupplier(sup)}
              >
                <input
                  type="radio"
                  name={`supplier-${radioPrefix}`}
                  checked={selectedSupplier === sup}
                  onChange={() => {}}
                  className={styles.radioInput}
                />
                <span>{sup}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Ranges */}
      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Khoảng giá</h3>
        <div className={styles.filterList}>
          <label
            className={`${styles.filterLabel} ${
              priceRange === null ? styles.activeFilterLabel : ''
            }`}
            onClick={() => onSelectPriceRange(null)}
          >
            <input
              type="radio"
              name={`priceRange-${radioPrefix}`}
              checked={priceRange === null}
              onChange={() => {}}
              className={styles.radioInput}
            />
            <span>Tất cả mức giá</span>
          </label>
          {PRICE_RANGES.map((range) => (
            <label
              key={range.id}
              className={`${styles.filterLabel} ${
                priceRange === range.id ? styles.activeFilterLabel : ''
              }`}
              onClick={() => onSelectPriceRange(range.id)}
            >
              <input
                type="radio"
                name={`priceRange-${radioPrefix}`}
                checked={priceRange === range.id}
                onChange={() => {}}
                className={styles.radioInput}
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
