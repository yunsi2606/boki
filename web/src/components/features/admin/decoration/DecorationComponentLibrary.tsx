'use client';

import React, { useState } from 'react';
import type { HomepageSectionConfig } from '@/config/homepageConfig';
import styles from './DecorationComponentLibrary.module.css';

interface PresetComponent {
  id: string;
  name: string;
  desc: string;
  group: 'PRODUCT' | 'BANNER';
  isAuto?: boolean;
  createConfig: () => Omit<HomepageSectionConfig, 'id'>;
  renderIcon: () => React.ReactNode;
}

const PRESET_COMPONENTS: PresetComponent[] = [
  // --- Sản phẩm và Ngành hàng ---
  {
    id: 'comp_top_best_sellers',
    name: 'Top Bán Chạy',
    desc: 'Xếp hạng top 10 trượt ngang',
    group: 'PRODUCT',
    isAuto: true,
    renderIcon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    createConfig: () => ({
      type: 'BEST_SELLERS',
      title: 'Top Sản Phẩm Bán Chạy',
      subtitle: 'Xếp hạng top 10 tựa sách & truyện tranh bán chạy nhất tuần qua',
      enabled: true,
      dataSource: 'BEST_SELLING',
      displayStyle: 'RANKING',
      sortBy: 'VIEWS_DESC',
      itemLimit: 10,
      showViewAll: true,
      viewAllUrl: '/books',
    }),
  },
  {
    id: 'comp_category_grid',
    name: 'Sản Phẩm Theo Ngành',
    desc: 'Lưới sách phân loại (Truyện tranh, Manga...)',
    group: 'PRODUCT',
    renderIcon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    createConfig: () => ({
      type: 'CATEGORY_LIST',
      title: 'Truyện Tranh & Manga Nổi Bật',
      subtitle: 'Tuyển tập các bộ truyện tranh đình đám với quà tặng và bookmark độc quyền',
      enabled: true,
      dataSource: 'CATEGORY',
      displayStyle: 'GRID',
      sortBy: 'NEWEST',
      categoryId: 2,
      categoryName: 'Sách Thiếu nhi',
      itemLimit: 8,
      showViewAll: true,
      viewAllUrl: '/books?category=2',
    }),
  },
  {
    id: 'comp_vip_members_slider',
    name: 'Sách Hội Viên VIP',
    desc: 'Trượt ngang ưu đãi 49K & Đọc thử VIP',
    group: 'PRODUCT',
    renderIcon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
      </svg>
    ),
    createConfig: () => ({
      type: 'DAILY_VIP',
      title: 'Sách Mới Mỗi Ngày – Dành Cho Hội Viên',
      subtitle: 'Độc quyền trải nghiệm đọc thử trọn vẹn dành riêng cho thành viên VIP',
      enabled: true,
      dataSource: 'VIP_MEMBERS',
      displayStyle: 'SLIDER',
      itemLimit: 8,
      showViewAll: true,
      viewAllUrl: '/books',
    }),
  },
  {
    id: 'comp_hot_tabs',
    name: 'Sản Phẩm Nổi Bật (Tabs)',
    desc: 'Chia theo tab Bản đặc biệt, Manga, LN',
    group: 'PRODUCT',
    renderIcon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    createConfig: () => ({
      type: 'HOT_RECOMMENDED',
      title: 'Gợi Ý Sách & Truyện Hot',
      subtitle: 'Khám phá các phiên bản đặc biệt, boxset giới hạn & bản thường mới nhất',
      enabled: true,
      dataSource: 'FEATURED_TABS',
      displayStyle: 'GRID',
      itemLimit: 8,
      showViewAll: false,
    }),
  },
  {
    id: 'comp_discounted_deals',
    name: 'Sách Giảm Giá Sốc',
    desc: 'Tự động lọc sách giảm giá sâu nhất',
    group: 'PRODUCT',
    isAuto: true,
    renderIcon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    createConfig: () => ({
      type: 'CATEGORY_LIST',
      title: 'Siêu Giảm Giá Sách Tháng Này',
      subtitle: 'Ưu đãi giảm giá sâu lên tới 50% dành cho bạn',
      enabled: true,
      dataSource: 'DISCOUNTED',
      displayStyle: 'GRID',
      sortBy: 'DISCOUNT_DESC',
      itemLimit: 8,
      showViewAll: true,
      viewAllUrl: '/books',
    }),
  },
  {
    id: 'comp_latest_arrivals',
    name: 'Sách Mới Nhập Kho',
    desc: 'Tự động hiển thị sách mới lên kệ',
    group: 'PRODUCT',
    isAuto: true,
    renderIcon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    createConfig: () => ({
      type: 'CATEGORY_LIST',
      title: 'Sách Mới Vừa Cập Bến',
      subtitle: 'Cập nhật những tựa sách mới nhất trong kho hàng',
      enabled: true,
      dataSource: 'LATEST',
      displayStyle: 'GRID',
      sortBy: 'NEWEST',
      itemLimit: 8,
      showViewAll: true,
      viewAllUrl: '/books',
    }),
  },
  // --- Hình ảnh và Văn bản ---
  {
    id: 'comp_vouchers',
    name: 'Vé Ưu Đãi Voucher',
    desc: 'Khối mã giảm giá vận chuyển & đơn hàng',
    group: 'BANNER',
    renderIcon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M12 6v12" strokeDasharray="3 3" />
        <circle cx="2" cy="12" r="2" />
        <circle cx="22" cy="12" r="2" />
      </svg>
    ),
    createConfig: () => ({
      type: 'VOUCHERS',
      title: 'Mã Giảm Giá & Ưu Đãi Vận Chuyển',
      subtitle: 'Thu thập voucher freeship và giảm giá ngay hôm nay',
      enabled: true,
      dataSource: 'VOUCHERS',
      displayStyle: 'GRID',
      itemLimit: 4,
      showViewAll: false,
    }),
  },
];

interface DecorationComponentLibraryProps {
  onAddComponent: (config: Omit<HomepageSectionConfig, 'id'>) => void;
}

export default function DecorationComponentLibrary({ onAddComponent }: DecorationComponentLibraryProps) {
  const [activeTab, setActiveTab] = useState<'BASIC' | 'TEMPLATES'>('BASIC');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = PRESET_COMPONENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productComponents = filtered.filter((c) => c.group === 'PRODUCT');
  const bannerComponents = filtered.filter((c) => c.group === 'BANNER');

  return (
    <div className={styles.libraryWrapper}>
      <div className={styles.libraryHeader}>
        <div className={styles.headerTitle}>Thành Phần Trang Trí</div>
        <div className={styles.headerSubtitle}>Bấm để thêm khối vào trang chủ</div>

        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm thành phần..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tabsRow}>
        <button
          type="button"
          onClick={() => setActiveTab('BASIC')}
          className={`${styles.tabBtn} ${activeTab === 'BASIC' ? styles.tabBtnActive : ''}`}
        >
          Thiết kế căn bản
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TEMPLATES')}
          className={`${styles.tabBtn} ${activeTab === 'TEMPLATES' ? styles.tabBtnActive : ''}`}
        >
          Mẫu có sẵn
        </button>
      </div>

      <div className={styles.accordionBody}>
        {/* Nhóm: Sản phẩm và Ngành hàng */}
        <div>
          <div className={styles.groupTitle}>
            <span>Sản phẩm và Ngành hàng</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>({productComponents.length})</span>
          </div>

          <div className={styles.componentGrid}>
            {productComponents.map((item) => (
              <div
                key={item.id}
                onClick={() => onAddComponent(item.createConfig())}
                className={styles.componentCard}
                title="Bấm để thêm khối này vào trang chủ"
              >
                <div className={styles.iconWrapper}>
                  {item.renderIcon()}
                </div>
                <div className={styles.cardTitle}>{item.name}</div>
                <div className={styles.cardDesc}>{item.desc}</div>
                {item.isAuto && <span className={styles.badgeAuto}>Tự động</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Nhóm: Hình ảnh và Văn bản */}
        <div>
          <div className={styles.groupTitle}>
            <span>Hình ảnh và Văn bản</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>({bannerComponents.length})</span>
          </div>

          <div className={styles.componentGrid}>
            {bannerComponents.map((item) => (
              <div
                key={item.id}
                onClick={() => onAddComponent(item.createConfig())}
                className={styles.componentCard}
                title="Bấm để thêm khối này vào trang chủ"
              >
                <div className={styles.iconWrapper}>
                  {item.renderIcon()}
                </div>
                <div className={styles.cardTitle}>{item.name}</div>
                <div className={styles.cardDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
