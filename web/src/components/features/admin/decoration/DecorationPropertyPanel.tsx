'use client';

import type {
  HomepageSectionConfig,
  DataLoadSource,
  SectionDisplayStyle,
  SectionSortBy,
} from '@/config/homepageConfig';
import type { Category } from '@/types';
import styles from './DecorationPropertyPanel.module.css';

interface DecorationPropertyPanelProps {
  section: HomepageSectionConfig | null;
  categories: Category[];
  onChange: (updates: Partial<HomepageSectionConfig>) => void;
}

export default function DecorationPropertyPanel({
  section,
  categories,
  onChange,
}: DecorationPropertyPanelProps) {
  if (!section) {
    return (
      <div className={styles.panelWrapper}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Thiết Lập Khối</h3>
        </div>
        <div className={styles.noSelection}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
          <span>Vui lòng chọn một khối từ cột giữa để điều chỉnh tiêu đề & điều kiện tải dữ liệu.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ee4d2d" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Thiết Lập Khối
        </h3>
        <span className={styles.selectedBadge} title={section.title}>
          {section.title}
        </span>
      </div>

      <div className={styles.panelBody}>
        {/* Nhóm 1: Tiêu đề & Nội dung */}
        <div className={styles.sectionGroup}>
          <h4 className={styles.groupHeading}>1. Tiêu Đề & Nội Dung</h4>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tiêu đề chính (Section Title)</label>
            <input
              type="text"
              value={section.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className={styles.textInput}
              placeholder="VD: TRUYỆN CHỮ, TRUYỆN TRANH, Sách Mới Mỗi Ngày..."
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mô tả phụ (Subtitle)</label>
            <input
              type="text"
              value={section.subtitle || ''}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              className={styles.textInput}
              placeholder="VD: Độc quyền trải nghiệm đọc thử..."
            />
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={section.showViewAll !== false}
              onChange={(e) => onChange({ showViewAll: e.target.checked })}
            />
            <span>Hiển thị nút "Xem tất cả / Xem thêm"</span>
          </label>

          {section.showViewAll !== false && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Đường dẫn liên kết (Link URL)</label>
              <input
                type="text"
                value={section.viewAllUrl || ''}
                onChange={(e) => onChange({ viewAllUrl: e.target.value })}
                className={styles.textInput}
                placeholder="Mặc định: /books?category=... hoặc /books"
              />
            </div>
          )}
        </div>

        {/* Nhóm 2: Điều kiện tải dữ liệu */}
        <div className={styles.sectionGroup}>
          <h4 className={styles.groupHeading}>2. Điều Kiện Tải Dữ Liệu</h4>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Nguồn dữ liệu (Data Source)</label>
            <select
              value={section.dataSource || 'CATEGORY'}
              onChange={(e) => {
                const newSource = e.target.value as DataLoadSource;
                onChange({
                  dataSource: newSource,
                  type:
                    newSource === 'BEST_SELLING'
                      ? 'BEST_SELLERS'
                      : newSource === 'VIP_MEMBERS'
                      ? 'DAILY_VIP'
                      : newSource === 'FEATURED_TABS'
                      ? 'HOT_RECOMMENDED'
                      : newSource === 'VOUCHERS'
                      ? 'VOUCHERS'
                      : 'CATEGORY_LIST',
                });
              }}
              className={styles.selectInput}
            >
              <option value="CATEGORY">Lọc theo ngành hàng / Thể loại sách</option>
              <option value="BEST_SELLING">Sách bán chạy nhất (Top Views & Bán)</option>
              <option value="VIP_MEMBERS">Sách hội viên VIP (Ưu đãi 49K & Đọc thử)</option>
              <option value="LATEST">Sách mới nhất vừa nhập kho</option>
              <option value="DISCOUNTED">Sách giảm giá khuyến mãi sâu nhất</option>
              <option value="FEATURED_TABS">Bộ sưu tập chia Tab (Bản đặc biệt, Manga, LN)</option>
              <option value="VOUCHERS">Khối vé ưu đãi & mã giảm giá</option>
            </select>
          </div>

          {section.dataSource === 'CATEGORY' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Chọn ngành hàng cụ thể</label>
              <select
                value={section.categoryId || ''}
                onChange={(e) => {
                  const catId = Number(e.target.value);
                  const found = categories.find((c) => c.id === catId);
                  onChange({
                    categoryId: catId,
                    categoryName: found ? found.name : '',
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
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Quy tắc sắp xếp (Sort By)</label>
            <select
              value={section.sortBy || 'DEFAULT'}
              onChange={(e) => onChange({ sortBy: e.target.value as SectionSortBy })}
              className={styles.selectInput}
            >
              <option value="DEFAULT">Mặc định của hệ thống</option>
              <option value="VIEWS_DESC">Lượt xem & Phổ biến cao nhất</option>
              <option value="NEWEST">Ngày tạo mới nhất</option>
              <option value="PRICE_ASC">Giá từ thấp đến cao</option>
              <option value="PRICE_DESC">Giá từ cao xuống thấp</option>
              <option value="DISCOUNT_DESC">Mức giảm giá nhiều nhất</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Số lượng sản phẩm tải (Item Limit)</label>
            <select
              value={section.itemLimit || 8}
              onChange={(e) => onChange({ itemLimit: Number(e.target.value) })}
              className={styles.selectInput}
            >
              <option value={4}>4 cuốn</option>
              <option value={8}>8 cuốn (Khuyên dùng cho Lưới)</option>
              <option value={10}>10 cuốn (Khuyên dùng cho Top Xếp hạng)</option>
              <option value={12}>12 cuốn</option>
              <option value={16}>16 cuốn</option>
            </select>
          </div>
        </div>

        {/* Nhóm 3: Kiểu giao diện hiển thị */}
        <div className={styles.sectionGroup}>
          <h4 className={styles.groupHeading}>3. Kiểu Giao Diện Hiển Thị</h4>

          <div className={styles.styleOptionsGrid}>
            <div
              onClick={() => onChange({ displayStyle: 'GRID' })}
              className={`${styles.styleCard} ${section.displayStyle === 'GRID' ? styles.styleCardActive : ''}`}
            >
              <div className={styles.styleCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <span className={styles.styleCardTitle}>Lưới Grid</span>
            </div>

            <div
              onClick={() => onChange({ displayStyle: 'SLIDER' })}
              className={`${styles.styleCard} ${section.displayStyle === 'SLIDER' ? styles.styleCardActive : ''}`}
            >
              <div className={styles.styleCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <span className={styles.styleCardTitle}>Trượt Ngang</span>
            </div>

            <div
              onClick={() => onChange({ displayStyle: 'RANKING' })}
              className={`${styles.styleCard} ${section.displayStyle === 'RANKING' ? styles.styleCardActive : ''}`}
            >
              <div className={styles.styleCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span className={styles.styleCardTitle}>Xếp Hạng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
