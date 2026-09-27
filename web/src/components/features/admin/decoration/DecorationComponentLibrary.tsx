'use client';

import { useState } from 'react';
import type { HomepageSectionConfig, HomepageSectionType, DataLoadSource, SectionDisplayStyle } from '@/config/homepageConfig';
import styles from './DecorationComponentLibrary.module.css';

interface PresetComponent {
  id: string;
  name: string;
  desc: string;
  group: 'PRODUCT' | 'BANNER';
  isAuto?: boolean;
  createConfig: () => Omit<HomepageSectionConfig, 'id'>;
}

const PRESET_COMPONENTS: PresetComponent[] = [
  // --- Sản phẩm và Ngành hàng ---
  {
    id: 'comp_top_best_sellers',
    name: 'Top Bán Chạy',
    desc: 'Top 10 xếp hạng trượt ngang',
    group: 'PRODUCT',
    isAuto: true,
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
    name: 'Sản Phẩm Theo Ngành Hàng',
    desc: 'Lưới sách phân loại (Truyện tranh, Truyện chữ...)',
    group: 'PRODUCT',
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
    desc: 'Thanh trượt ngang ưu đãi 49K & Đọc thử VIP',
    group: 'PRODUCT',
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
    desc: 'Gợi ý chia theo tab Bản đặc biệt, Manga, LN',
    group: 'PRODUCT',
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
    desc: 'Lọc tự động sản phẩm giảm giá mạnh nhất',
    group: 'PRODUCT',
    isAuto: true,
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
    desc: 'Sản phẩm mới lên kệ gần đây nhất',
    group: 'PRODUCT',
    isAuto: true,
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
    desc: 'Khối mã giảm giá vận chuyển & sản phẩm',
    group: 'BANNER',
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
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>Thành Phần Trang Trí</div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Chọn hoặc bấm để thêm khối vào trang chủ</div>

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
            <span style={{ fontSize: '11px', color: '#64748b' }}>({productComponents.length})</span>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
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
            <span style={{ fontSize: '11px', color: '#64748b' }}>({bannerComponents.length})</span>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
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
