'use client';

import React from 'react';
import type { WidgetMetric } from '@/types/recommendation';
import { LayoutGrid, Layers, Package, ShoppingCart } from 'lucide-react';
import styles from './WidgetPerformanceTable.module.css';

interface Props {
  metrics: WidgetMetric[];
}

const WIDGET_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  HOMEPAGE_PERSONALIZED: {
    label: 'Trang chủ: Gợi ý theo sở thích',
    icon: <LayoutGrid size={14} color="#0284c7" />,
  },
  DETAIL_SIMILAR: {
    label: 'Trang chi tiết: Sách tương đồng',
    icon: <Layers size={14} color="#7c3aed" />,
  },
  DETAIL_FREQUENTLY_BOUGHT: {
    label: 'Trang chi tiết: Thường mua cùng',
    icon: <Package size={14} color="#16a34a" />,
  },
  CART_ADDONS: {
    label: 'Giỏ hàng: Mua kèm ưu đãi',
    icon: <ShoppingCart size={14} color="#ea580c" />,
  },
};

export default function WidgetPerformanceTable({ metrics }: Props) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Hiệu Quả Từng Vị Trí Gợi Ý</h3>
        <div className={styles.emptyState}>Chưa có đủ dữ liệu ghi nhận trong khoảng thời gian này.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Hiệu Quả Từng Vị Trí Gợi Ý</h3>
          <p className={styles.subtitle}>Phân tích chi tiết lượt xem, click và chuyển đổi theo vị trí tiện ích</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Vị Trí Tiện Ích (Widget)</th>
              <th className={styles.th}>Lượt Xem</th>
              <th className={styles.th}>Lượt Nhấp</th>
              <th className={styles.th}>CTR</th>
              <th className={styles.th}>Thêm Vào Giỏ</th>
              <th className={styles.th}>Đơn Hàng</th>
              <th className={styles.th}>Tỷ Lệ Chuyển Đổi</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((row) => {
              const conf = WIDGET_CONFIG[row.widgetType] || {
                label: row.widgetType,
                icon: <LayoutGrid size={14} />,
              };
              return (
                <tr key={row.widgetType} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.widgetBadge}>
                      {conf.icon}
                      {conf.label}
                    </span>
                  </td>
                  <td className={styles.td}>{(row.impressions || 0).toLocaleString('vi-VN')}</td>
                  <td className={styles.td}>{(row.clicks || 0).toLocaleString('vi-VN')}</td>
                  <td className={styles.td}>
                    <span className={styles.ratePill}>{(row.ctr || 0).toFixed(2)}%</span>
                  </td>
                  <td className={styles.td}>{(row.cartConversions || 0).toLocaleString('vi-VN')}</td>
                  <td className={styles.td}>{(row.orderConversions || 0).toLocaleString('vi-VN')}</td>
                  <td className={styles.td}>
                    <span className={styles.ratePill}>{(row.conversionRate || 0).toFixed(2)}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
