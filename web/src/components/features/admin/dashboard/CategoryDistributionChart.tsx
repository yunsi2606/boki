'use client';

import { useMemo } from 'react';
import { PieChart } from 'lucide-react';
import type { CategoryRevenueShare } from '@/types/adminAnalytics';
import styles from './categoryDistributionChart.module.css';

const PALETTE = ['#EE4D2D', '#FF9800', '#20C997', '#3182CE', '#9333EA', '#868E96'];

interface CategoryDistributionChartProps {
  categories: CategoryRevenueShare[];
  isLoading?: boolean;
}

export default function CategoryDistributionChart({
  categories,
  isLoading,
}: CategoryDistributionChartProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const totalRev = useMemo(() => {
    return categories.reduce((sum, c) => sum + (Number(c.revenue) || 0), 0);
  }, [categories]);

  // Compute SVG Donut segments
  const donutSegments = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    return categories.map((cat, idx) => {
      const pct = Math.max(cat.percentage, 0);
      const dashLength = (pct / 100) * circumference;
      const strokeColor = PALETTE[idx % PALETTE.length];
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += dashLength;

      return {
        cat,
        strokeColor,
        dashArray: `${dashLength} ${circumference - dashLength}`,
        strokeDashoffset,
      };
    });
  }, [categories]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconBadge}>
          <PieChart size={18} />
        </div>
        <div>
          <h3 className={styles.title}>Cơ Cấu Thể Loại Sách</h3>
          <p className={styles.subtitle}>Tỷ trọng doanh thu theo từng danh mục</p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingBox}>Đang tính toán tỷ trọng...</div>
      ) : categories.length === 0 ? (
        <div className={styles.emptyBox}>Chưa có phát sinh doanh thu theo danh mục</div>
      ) : (
        <div className={styles.body}>
          {/* Slim Donut graphic */}
          <div className={styles.donutWrapper}>
            <svg viewBox="0 0 120 120" className={styles.donutSvg}>
              {/* Background base track */}
              <circle cx="60" cy="60" r="48" className={styles.donutTrack} />

              {/* Segments */}
              {donutSegments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r="48"
                  stroke={seg.strokeColor}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className={styles.donutSegment}
                />
              ))}
            </svg>

            <div className={styles.donutCenter}>
              <span className={styles.donutCenterValue}>
                {categories.length}
              </span>
              <span className={styles.donutCenterLabel}>Thể loại</span>
            </div>
          </div>

          {/* Breakdown list with Progress Bars */}
          <div className={styles.categoryList}>
            {categories.map((cat, idx) => {
              const color = PALETTE[idx % PALETTE.length];
              return (
                <div key={idx} className={styles.categoryItem}>
                  <div className={styles.itemHeader}>
                    <div className={styles.itemLeft}>
                      <span className={styles.colorDot} style={{ backgroundColor: color }} />
                      <span className={styles.categoryName} title={cat.categoryName}>
                        {cat.categoryName}
                      </span>
                      <span className={styles.unitsChip}>
                        {cat.unitsSold} cuốn
                      </span>
                    </div>

                    <div className={styles.itemRight}>
                      <span className={styles.pctBadge}>{cat.percentage}%</span>
                      <span className={styles.amountText}>{formatCurrency(cat.revenue)}</span>
                    </div>
                  </div>

                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(Math.max(cat.percentage, 5), 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
