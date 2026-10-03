'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { HomepageSectionConfig } from '@/config/homepageConfig';
import { PRESET_COMPONENTS } from './presetComponents';
import styles from './DecorationComponentLibrary.module.css';

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
          <Search size={14} className={styles.searchIcon} strokeWidth={2.5} />
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
