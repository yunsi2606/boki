'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { categoryService } from '@/services/categoryService';
import {
  defaultHomepageConfig,
  type HomepageConfig,
  type HomepageSectionConfig,
} from '@/config/homepageConfig';
import type { Category } from '@/types';
import DecorationComponentLibrary from '../decoration/DecorationComponentLibrary';
import DecorationCanvas from '../decoration/DecorationCanvas';
import DecorationPropertyPanel from '../decoration/DecorationPropertyPanel';
import styles from './ShopDecorationTab.module.css';

interface ShopDecorationTabProps {
  onSuccessNotice: (msg: string) => void;
}

export default function ShopDecorationTab({ onSuccessNotice }: ShopDecorationTabProps) {
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [storeConfig, catList] = await Promise.all([
          adminService.getStoreConfig(),
          categoryService.getCategories().catch(() => []),
        ]);

        if (storeConfig) {
          if (!storeConfig.sections || storeConfig.sections.length === 0) {
            storeConfig.sections = defaultHomepageConfig.sections;
          }
          setConfig(storeConfig);
          if (storeConfig.sections.length > 0) {
            setSelectedId(storeConfig.sections[0].id);
          }
        } else {
          setSelectedId(defaultHomepageConfig.sections[0]?.id || null);
        }
        setCategories(catList || []);
      } catch (err) {
        console.error('Failed to load shop decoration data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const sections = config.sections || defaultHomepageConfig.sections;

  const updateSections = (newSections: HomepageSectionConfig[]) => {
    setConfig((prev) => ({
      ...prev,
      sections: newSections,
    }));
  };

  // Add component from library (Shopee style)
  const handleAddComponent = (newSectionConfig: Omit<HomepageSectionConfig, 'id'>) => {
    const newId = `sec_${Date.now()}`;
    const newSec: HomepageSectionConfig = {
      ...newSectionConfig,
      id: newId,
    };
    const updated = [...sections, newSec];
    updateSections(updated);
    setSelectedId(newId);
  };

  // Reorder sections
  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updateSections(updated);
  };

  // Toggle visibility
  const handleToggleEnabled = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    updateSections(updated);
  };

  // Delete section
  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) {
      alert('Trang chủ phải giữ lại ít nhất 1 section.');
      return;
    }
    const updated = sections.filter((s) => s.id !== id);
    updateSections(updated);
    if (selectedId === id) {
      setSelectedId(updated[0]?.id || null);
    }
  };

  // Update selected section fields
  const handleUpdateSelected = (updates: Partial<HomepageSectionConfig>) => {
    if (!selectedId) return;
    const updated = sections.map((s) => (s.id === selectedId ? { ...s, ...updates } : s));
    updateSections(updated);
  };

  // Reset default
  const handleResetDefault = () => {
    if (confirm('Bạn có chắc muốn khôi phục bố cục trang chủ về mặc định ban đầu không?')) {
      updateSections(defaultHomepageConfig.sections);
      setSelectedId(defaultHomepageConfig.sections[0]?.id || null);
      onSuccessNotice('Đã khôi phục bố cục các section về mặc định.');
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateStoreConfig(config);
      onSuccessNotice('Lưu thiết kế trang chủ thành công! Giao diện khách hàng đã được đồng bộ.');
    } catch (err) {
      console.error('Failed to save store decoration', err);
      alert('Lưu cấu hình thất bại, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedId) || null;

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <span>Đang tải dữ liệu thiết kế trang chủ...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Action Bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerInfo}>
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Trang Trí Trang Chủ (Shopee Style)
          </h2>
          <p>Kéo thả sắp xếp thứ tự, bổ sung khối mới từ danh mục và tuỳ chỉnh điều kiện tải dữ liệu.</p>
        </div>

        <div className={styles.actionButtons}>
          <button type="button" onClick={handleResetDefault} className={styles.resetBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Khôi phục mặc định
          </button>

          <button type="button" onClick={handleSave} disabled={saving} className={styles.saveBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {saving ? 'Đang lưu...' : 'Lưu Thiết Kế'}
          </button>
        </div>
      </div>

      {/* 3-Column Shopee Decoration Workspace */}
      <div className={styles.decorationWorkspace}>
        {/* Cột 1: Thư viện khối (Palette) */}
        <DecorationComponentLibrary onAddComponent={handleAddComponent} />

        {/* Cột 2: Khung Canvas sắp xếp */}
        <DecorationCanvas
          sections={sections}
          selectedId={selectedId}
          onSelectSection={setSelectedId}
          onReorder={handleReorder}
          onToggleEnabled={handleToggleEnabled}
          onDeleteSection={handleDeleteSection}
        />

        {/* Cột 3: Bảng cấu hình thuộc tính khối đang chọn */}
        <DecorationPropertyPanel
          section={selectedSection}
          categories={categories}
          onChange={handleUpdateSelected}
        />
      </div>
    </div>
  );
}
