'use client';

import { useState, useMemo } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import type { DailyRevenuePoint } from '@/types/adminAnalytics';
import styles from './revenueTrendChart.module.css';

interface RevenueTrendChartProps {
  timeline: DailyRevenuePoint[];
  totalRevenue: number;
  totalOrders: number;
  days: number;
  onDaysChange: (days: number) => void;
  isLoading?: boolean;
}

export default function RevenueTrendChart({
  timeline,
  totalRevenue,
  totalOrders,
  days,
  onDaysChange,
  isLoading,
}: RevenueTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const chartData = useMemo(() => {
    if (!timeline || timeline.length === 0) {
      return { points: [], maxVal: 1, pathD: '', areaD: '', width: 640, height: 180 };
    }

    const maxVal = Math.max(...timeline.map((d) => Number(d.revenue) || 0), 100000);
    const width = 640;
    const height = 180;
    const paddingX = 20;
    const paddingY = 20;

    const availableWidth = width - paddingX * 2;
    const availableHeight = height - paddingY * 2;
    const stepX = timeline.length > 1 ? availableWidth / (timeline.length - 1) : availableWidth / 2;

    const coords = timeline.map((item, idx) => {
      const x = paddingX + idx * stepX;
      const rev = Number(item.revenue) || 0;
      const y = height - paddingY - (rev / maxVal) * availableHeight;
      return { x, y, item };
    });

    // Build curved SVG path
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }

    const last = coords[coords.length - 1];
    const first = coords[0];
    const areaD = `${pathD} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;

    return { points: coords, maxVal, pathD, areaD, width, height };
  }, [timeline]);

  return (
    <div className={styles.chartCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBadge}>
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className={styles.chartTitle}>Xu Hướng Doanh Thu</h3>
            <p className={styles.chartSubtitle}>
              {days} ngày qua: <strong>{formatCurrency(totalRevenue)}</strong> ({totalOrders} đơn hàng)
            </p>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterBtn} ${days === 7 ? styles.filterBtnActive : ''}`}
            onClick={() => onDaysChange(7)}
            disabled={isLoading}
          >
            7 ngày
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${days === 30 ? styles.filterBtnActive : ''}`}
            onClick={() => onDaysChange(30)}
            disabled={isLoading}
          >
            30 ngày
          </button>
        </div>
      </div>

      <div className={styles.svgWrapper}>
        {isLoading ? (
          <div className={styles.loadingBox}>Đang tải biểu đồ...</div>
        ) : timeline.length === 0 ? (
          <div className={styles.emptyBox}>Chưa có dữ liệu giao dịch trong khoảng thời gian này</div>
        ) : (
          <svg
            viewBox={`0 0 ${chartData.width} ${chartData.height}`}
            className={styles.svgChart}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EE4D2D" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#EE4D2D" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            <line x1="20" y1="20" x2="620" y2="20" className={styles.gridLine} />
            <line x1="20" y1="80" x2="620" y2="80" className={styles.gridLine} />
            <line x1="20" y1="140" x2="620" y2="140" className={styles.gridLine} />

            {/* Gradient Area Fill */}
            <path d={chartData.areaD} fill="url(#revenueGradient)" />

            {/* Curve Stroke Line */}
            <path d={chartData.pathD} fill="none" className={styles.lineStroke} />

            {/* Interactive Data Points */}
            {chartData.points.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={styles.pointGroup}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    className={`${styles.pointCircle} ${isHovered ? styles.pointCircleHovered : ''}`}
                  />
                  {/* Invisible larger hover zone for easier touch */}
                  <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />
                </g>
              );
            })}
          </svg>
        )}

        {/* Floating Tooltip */}
        {hoveredIndex !== null && chartData.points[hoveredIndex] && (
          <div
            className={styles.tooltip}
            style={{
              left: `${(chartData.points[hoveredIndex].x / chartData.width) * 100}%`,
              top: `${(chartData.points[hoveredIndex].y / chartData.height) * 100}%`,
            }}
          >
            <div className={styles.tooltipDate}>
              <Calendar size={11} />
              <span>{chartData.points[hoveredIndex].item.date}</span>
            </div>
            <div className={styles.tooltipRevenue}>
              {formatCurrency(Number(chartData.points[hoveredIndex].item.revenue))}
            </div>
            <div className={styles.tooltipOrders}>
              {chartData.points[hoveredIndex].item.ordersCount} đơn hàng
            </div>
          </div>
        )}
      </div>

      {/* Date Labels below chart */}
      <div className={styles.dateLabelsRow}>
        {timeline.map((item, idx) => {
          // Show fewer labels on 30-day view
          const shouldShow = days === 7 || idx === 0 || idx === Math.floor(days / 2) || idx === days - 1;
          if (!shouldShow) return <span key={idx} className={styles.dateLabelEmpty} />;
          const shortDate = item.date.slice(5); // "MM-DD"
          return (
            <span key={idx} className={styles.dateLabel}>
              {shortDate}
            </span>
          );
        })}
      </div>
    </div>
  );
}
