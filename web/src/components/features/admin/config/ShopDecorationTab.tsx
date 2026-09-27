'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { categoryService } from '@/services/categoryService';
import {
  defaultHomepageConfig,
  type HomepageConfig,
  type HomepageSectionConfig,
  type HomepageSectionType,
} from '@/config/homepageConfig';
import type { Category } from '@/types';
import styles from './ShopDecorationTab.module.css';

interface ShopDecorationTabProps {
  onSuccessNotice: (msg: string) => void;
}

export default function ShopDecorationTab({ onSuccessNotice }: ShopDecorationTabProps) {
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
    setConfig({
      ...config,
      sections: newSections,
    });
  };

  // Reorder up / down
  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updateSections(updated);
  };

  // Drag and Drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveSection(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Toggle enable / disable
  const toggleSection = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    updateSections(updated);
  };

  // Delete section
  const deleteSection = (id: string) => {
    if (sections.length <= 1) {
      alert('Trang chủ phải giữ lại ít nhất 1 section.');
      return;
    }
    const updated = sections.filter((s) => s.id !== id);
    updateSections(updated);
    if (expandedId === id) setExpandedId(null);
  };

  // Update specific field of a section
  const updateSectionField = (id: string, updates: Partial<HomepageSectionConfig>) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, ...updates } : s));
    updateSections(updated);
  };

  // Add new section preset
  const addSection = (type: HomepageSectionType) => {
    const newId = `sec_${Date.now()}`;
    let newSec: HomepageSectionConfig;

    switch (type) {
      case 'BEST_SELLERS':
        newSec = {
          id: newId,
          type: 'BEST_SELLERS',
          title: 'Top Sản Phẩm Bán Chạy',
          subtitle: 'Xếp hạng top 10 tựa sách được mua nhiều nhất',
          enabled: true,
          itemLimit: 10,
        };
        break;

      case 'HOT_RECOMMENDED':
        newSec = {
          id: newId,
          type: 'HOT_RECOMMENDED',
          title: 'Gợi Ý Sách & Truyện Hot',
          subtitle: 'Phiên bản đặc biệt & tuyển tập truyện tranh mới nhất',
          enabled: true,
        };
        break;

      case 'CATEGORY_LIST':
        newSec = {
          id: newId,
          type: 'CATEGORY_LIST',
          title: 'Danh Sách Theo Thể Loại Mới',
          subtitle: 'Khám phá các tựa sách hay theo danh mục tuyển chọn',
          enabled: true,
          categoryId: categories[0]?.id || 1,
          categoryName: categories[0]?.name || 'Sách Văn học',
          itemLimit: 8,
        };
        break;

      case 'DAILY_VIP':
        newSec = {
          id: newId,
          type: 'DAILY_VIP',
          title: 'Sách Mới Mỗi Ngày - Dành Cho Hội Viên',
          subtitle: 'Độc quyền trải nghiệm đọc thử trọn vẹn dành riêng cho VIP',
          enabled: true,
        };
        break;

      case 'VOUCHERS':
        newSec = {
          id: newId,
          type: 'VOUCHERS',
          title: 'Mã Giảm Giá & Ưu Đãi',
          subtitle: 'Thu thập voucher freeship và mã giảm giá mua sách',
          enabled: true,
        };
        break;
    }

    updateSections([...sections, newSec]);
    setExpandedId(newId);
  };

  // Reset to default
  const handleResetDefault = () => {
    if (confirm('Bạn có chắc muốn khôi phục bố cục trang chủ về mặc định ban đầu không?')) {
      updateSections(defaultHomepageConfig.sections);
      onSuccessNotice('Đã khôi phục bố cục các section về mặc định.');
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateStoreConfig(config);
      onSuccessNotice('✨ Lưu thiết kế trang chủ thành công! Giao diện khách hàng đã được đồng bộ.');
    } catch (err) {
      console.error('Failed to save store decoration', err);
      alert('Lưu cấu hình thất bại, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const getTypeBadgeClass = (type: HomepageSectionType) => {
    switch (type) {
      case 'BEST_SELLERS':
        return styles.typeBadgeBestSellers;
      case 'HOT_RECOMMENDED':
        return styles.typeBadgeHotRecommended;
      case 'CATEGORY_LIST':
        return styles.typeBadgeCategoryList;
      case 'DAILY_VIP':
        return styles.typeBadgeDailyVip;
      case 'VOUCHERS':
        return styles.typeBadgeVouchers;
      default:
        return '';
    }
  };

  const getTypeName = (type: HomepageSectionType) => {
    switch (type) {
      case 'BEST_SELLERS':
        return 'Top Bán Chạy (1..10)';
      case 'HOT_RECOMMENDED':
        return 'Gợi Ý Sách Hot (Tabs)';
      case 'CATEGORY_LIST':
        return 'Danh Sách Theo Thể Loại';
      case 'DAILY_VIP':
        return 'Sách Hội Viên VIP';
      case 'VOUCHERS':
        return 'Vé Voucher Ưu Đãi';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        Đang tải bố cục trang trí trang chủ...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerInfo}>
          <h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            Trang Trí Trang Chủ (Shop Decoration)
          </h2>
          <p>
            Kéo thả, sắp xếp vị trí và tùy biến nội dung các mục hiển thị trên trang chủ như tính năng trang trí shop của Shopee.
          </p>
        </div>

        <div className={styles.actionButtons}>
          <button type="button" onClick={handleResetDefault} className={styles.resetBtn}>
            Khôi phục mặc định
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className={styles.saveBtn}>
            {saving ? 'Đang lưu...' : 'Lưu Thiết Kế Trang Chủ'}
          </button>
        </div>
      </div>

      <div className={styles.layoutGrid}>
        {/* Left Side: Drag-and-drop Sections Builder */}
        <div className={styles.builderCard}>
          <div className={styles.cardTop}>
            <h3>Các Mục Bố Cục Trang Chủ (Từ Trên Xuống Dưới)</h3>
            <span className={styles.sectionCount}>{sections.length} Section</span>
          </div>

          <div className={styles.sectionList}>
            {sections.map((sec, idx) => {
              const isExpanded = expandedId === sec.id;
              const isDragging = draggedIndex === idx;

              return (
                <div
                  key={sec.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`${styles.sectionItem} ${!sec.enabled ? styles.sectionItemDisabled : ''} ${
                    isDragging ? styles.sectionItemDragging : ''
                  }`}
                >
                  <div className={styles.itemHeader}>
                    <div className={styles.leftGroup}>
                      {/* Reorder Arrows */}
                      <div className={styles.reorderButtons}>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, idx - 1)}
                          disabled={idx === 0}
                          className={styles.arrowBtn}
                          title="Di chuyển lên trên"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, idx + 1)}
                          disabled={idx === sections.length - 1}
                          className={styles.arrowBtn}
                          title="Di chuyển xuống dưới"
                        >
                          ▼
                        </button>
                      </div>

                      <div className={styles.dragHandle} title="Kéo để di chuyển vị trí">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="9" cy="6" r="1.5" />
                          <circle cx="15" cy="6" r="1.5" />
                          <circle cx="9" cy="12" r="1.5" />
                          <circle cx="15" cy="12" r="1.5" />
                          <circle cx="9" cy="18" r="1.5" />
                          <circle cx="15" cy="18" r="1.5" />
                        </svg>
                      </div>

                      <span className={`${styles.typeBadge} ${getTypeBadgeClass(sec.type)}`}>
                        {getTypeName(sec.type)}
                      </span>

                      <div>
                        <div className={styles.itemTitle}>{sec.title}</div>
                        {sec.subtitle && <div className={styles.itemSubtitle}>{sec.subtitle}</div>}
                      </div>
                    </div>

                    <div className={styles.rightGroup}>
                      {/* Visibility Switch */}
                      <label className={styles.switchToggle} title={sec.enabled ? 'Đang bật hiển thị' : 'Đang ẩn'}>
                        <input
                          type="checkbox"
                          checked={sec.enabled}
                          onChange={() => toggleSection(sec.id)}
                        />
                        <span className={styles.slider}></span>
                      </label>

                      {/* Expand / Edit Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : sec.id)}
                        className={styles.iconBtn}
                        title="Tùy chỉnh thông tin section"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {isExpanded ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteSection(sec.id)}
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        title="Xóa section này"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Inline Expanded Edit Form */}
                  {isExpanded && (
                    <div className={styles.editPanel}>
                      <div className={styles.editGroup}>
                        <label>Tiêu Đề Section (Hiển Thị Trên Trang Chủ)</label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => updateSectionField(sec.id, { title: e.target.value })}
                          className={styles.textInput}
                          placeholder="Ví dụ: Top Sản Phẩm Bán Chạy, Truyện Tranh Hot..."
                        />
                      </div>

                      <div className={styles.editGroup}>
                        <label>Loại Section (Giao Diện & Chức Năng)</label>
                        <select
                          value={sec.type}
                          onChange={(e) =>
                            updateSectionField(sec.id, {
                              type: e.target.value as HomepageSectionType,
                            })
                          }
                          className={styles.selectInput}
                        >
                          <option value="BEST_SELLERS">Top Bán Chạy (1..10, Trượt Ngang)</option>
                          <option value="HOT_RECOMMENDED">Gợi Ý Sách Hot (Dạng Tab Bộ Sưu Tập)</option>
                          <option value="CATEGORY_LIST">Danh Sách Theo Thể Loại Tuyển Chọn</option>
                          <option value="DAILY_VIP">Sách Mới Mỗi Ngày (Hội Viên VIP)</option>
                          <option value="VOUCHERS">Vé Voucher & Mã Giảm Giá</option>
                        </select>
                      </div>

                      <div className={`${styles.editGroup} ${styles.editGroupFull}`}>
                        <label>Mô Tả Phụ (Subtitle Dưới Tiêu Đề)</label>
                        <input
                          type="text"
                          value={sec.subtitle || ''}
                          onChange={(e) => updateSectionField(sec.id, { subtitle: e.target.value })}
                          className={styles.textInput}
                          placeholder="Mô tả tóm tắt nội dung hấp dẫn cho khách hàng..."
                        />
                      </div>

                      {sec.type === 'CATEGORY_LIST' && (
                        <>
                          <div className={styles.editGroup}>
                            <label>Chọn Thể Loại Sách Cần Hiển Thị</label>
                            <select
                              value={sec.categoryId || ''}
                              onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const foundCat = categories.find((c) => c.id === selectedId);
                                updateSectionField(sec.id, {
                                  categoryId: selectedId,
                                  categoryName: foundCat ? foundCat.name : '',
                                });
                              }}
                              className={styles.selectInput}
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className={styles.editGroup}>
                            <label>Số Lượng Sách Hiển Thị</label>
                            <select
                              value={sec.itemLimit || 8}
                              onChange={(e) =>
                                updateSectionField(sec.id, { itemLimit: Number(e.target.value) })
                              }
                              className={styles.selectInput}
                            >
                              <option value={4}>4 cuốn (1 hàng)</option>
                              <option value={8}>8 cuốn (2 hàng)</option>
                              <option value={12}>12 cuốn (3 hàng)</option>
                              <option value={16}>16 cuốn (4 hàng)</option>
                            </select>
                          </div>
                        </>
                      )}

                      {sec.type === 'BEST_SELLERS' && (
                        <div className={styles.editGroup}>
                          <label>Giới Hạn Xếp Hạng (Mặc định Top 10)</label>
                          <select
                            value={sec.itemLimit || 10}
                            onChange={(e) =>
                              updateSectionField(sec.id, { itemLimit: Number(e.target.value) })
                            }
                            className={styles.selectInput}
                          >
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10 (Khuyên dùng)</option>
                            <option value={15}>Top 15</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Add Presets Panel */}
          <div className={styles.addSectionBox}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
              + Thêm Khối Giao Diện Mới Vào Trang Chủ:
            </span>
            <div className={styles.presetGroup}>
              <button
                type="button"
                onClick={() => addSection('BEST_SELLERS')}
                className={styles.addPresetBtn}
              >
                + Top Bán Chạy (1..10)
              </button>
              <button
                type="button"
                onClick={() => addSection('CATEGORY_LIST')}
                className={styles.addPresetBtn}
              >
                + Danh Sách Theo Thể Loại
              </button>
              <button
                type="button"
                onClick={() => addSection('HOT_RECOMMENDED')}
                className={styles.addPresetBtn}
              >
                + Gợi Ý Sách Hot (Tabs)
              </button>
              <button
                type="button"
                onClick={() => addSection('DAILY_VIP')}
                className={styles.addPresetBtn}
              >
                + Sách Mới Hội Viên VIP
              </button>
              <button
                type="button"
                onClick={() => addSection('VOUCHERS')}
                className={styles.addPresetBtn}
              >
                + Mã Giảm Giá
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Mini Wireframe Live Layout Simulator */}
        <div className={styles.previewSidebar}>
          <h3 className={styles.previewTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2.5">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            Mô Phỏng Bố Cục Trang Chủ
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Thứ tự các khối trên website sẽ hiển thị lần lượt từ trên xuống dưới theo danh sách bạn đã sắp xếp.
          </p>

          <div className={styles.phoneFrame}>
            <div className={styles.wireframeHero}>Hero Banner & Đếm Ngược</div>
            <div className={styles.wireframeCircles}>
              <div className={styles.miniCircle}></div>
              <div className={styles.miniCircle}></div>
              <div className={styles.miniCircle}></div>
              <div className={styles.miniCircle}></div>
              <div className={styles.miniCircle}></div>
            </div>

            {sections.map((sec, i) => (
              <div
                key={sec.id}
                className={`${styles.wireframeSection} ${
                  !sec.enabled ? styles.wireframeSectionDisabled : ''
                }`}
              >
                <span>
                  #{i + 1} {sec.title}
                </span>
                <span
                  className={sec.enabled ? styles.wireframeDot : styles.wireframeDotOff}
                  title={sec.enabled ? 'Đang bật' : 'Đang ẩn'}
                ></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
