'use client';

import { useState, useMemo, useRef } from 'react';
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
  const svgRef = useRef<SVGSVGElement | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatShort = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace('.0', '')}tr`;
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return `${val}đ`;
  };

  const chart = useMemo(() => {
    const width = 720;
    const height = 220;
    const padLeft = 68;
    const padRight = 16;
    const padTop = 20;
    const padBottom = 32;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const baselineY = height - padBottom;

    if (!timeline || timeline.length === 0) {
      return { width, height, padLeft, baselineY, maxVal: 1, points: [], pathD: '', areaD: '', yTop: padTop, yMid: padTop + plotH / 2 };
    }

    const rawMax = Math.max(...timeline.map((d) => Number(d.revenue) || 0));
    // Round max value up to a sensible nice number (e.g. 200k, 500k, 1m)
    const maxVal = rawMax > 0 ? Math.ceil(rawMax / 50000) * 50000 : 100000;
    const stepX = timeline.length > 1 ? plotW / (timeline.length - 1) : plotW / 2;

    const points = timeline.map((item, idx) => {
      const x = padLeft + idx * stepX;
      const rev = Number(item.revenue) || 0;
      const y = baselineY - (rev / maxVal) * plotH;
      return { x, y, item, rev };
    });

    // Build smoothed curve path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const dx = curr.x - prev.x;
      // Smooth tension: only bend if points are not both zero
      const cpX1 = prev.x + dx * 0.35;
      const cpY1 = prev.y;
      const cpX2 = curr.x - dx * 0.35;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }

    const last = points[points.length - 1];
    const first = points[0];
    const areaD = `${pathD} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    return {
      width,
      height,
      padLeft,
      baselineY,
      maxVal,
      points,
      pathD,
      areaD,
      yTop: padTop,
      yMid: padTop + plotH / 2,
    };
  }, [timeline]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || chart.points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * chart.width;

    // Find closest data point
    let closestIdx = 0;
    let minDiff = Infinity;
    chart.points.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setHoveredIndex(closestIdx);
  };

  const hoveredPoint = hoveredIndex !== null ? chart.points[hoveredIndex] : null;

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

        <div className={styles.segmentedControl}>
          <button
            type="button"
            className={`${styles.segmentedBtn} ${days === 7 ? styles.segmentedBtnActive : ''}`}
            onClick={() => onDaysChange(7)}
            disabled={isLoading}
          >
            7 ngày
          </button>
          <button
            type="button"
            className={`${styles.segmentedBtn} ${days === 30 ? styles.segmentedBtnActive : ''}`}
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
            ref={svgRef}
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            className={styles.svgChart}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EE4D2D" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#EE4D2D" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            <line x1={chart.padLeft} y1={chart.yTop} x2={chart.width - 16} y2={chart.yTop} className={styles.gridLine} />
            <text x={chart.padLeft - 8} y={chart.yTop + 4} textAnchor="end" className={styles.axisLabel}>
              {formatShort(chart.maxVal)}
            </text>

            <line x1={chart.padLeft} y1={chart.yMid} x2={chart.width - 16} y2={chart.yMid} className={styles.gridLine} />
            <text x={chart.padLeft - 8} y={chart.yMid + 4} textAnchor="end" className={styles.axisLabel}>
              {formatShort(chart.maxVal / 2)}
            </text>

            <line x1={chart.padLeft} y1={chart.baselineY} x2={chart.width - 16} y2={chart.baselineY} className={styles.axisBaseLine} />
            <text x={chart.padLeft - 8} y={chart.baselineY + 4} textAnchor="end" className={styles.axisLabel}>
              0đ
            </text>

            {/* Area Fill */}
            <path d={chart.areaD} fill="url(#revGrad)" />

            {/* Spline Curve (NO static circle dots) */}
            <path d={chart.pathD} fill="none" className={styles.lineStroke} />

            {/* X-Axis Date Labels aligned directly on ticks */}
            {chart.points.map((pt, idx) => {
              const showDate = days === 7 || idx === 0 || idx === Math.floor(days / 4) || idx === Math.floor(days / 2) || idx === Math.floor((3 * days) / 4) || idx === days - 1;
              if (!showDate) return null;
              return (
                <text key={idx} x={pt.x} y={chart.baselineY + 18} textAnchor="middle" className={styles.axisDateLabel}>
                  {pt.item.date.slice(5)}
                </text>
              );
            })}

            {/* Interactive Crosshair & Single Active Point */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={chart.yTop}
                  x2={hoveredPoint.x}
                  y2={chart.baselineY}
                  className={styles.crosshairLine}
                />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={7} className={styles.activeGlowCircle} />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={3.5} className={styles.activePointCircle} />
              </g>
            )}
          </svg>
        )}

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className={styles.tooltip}
            style={{
              left: `${(hoveredPoint.x / chart.width) * 100}%`,
              top: `${(hoveredPoint.y / chart.height) * 100}%`,
            }}
          >
            <div className={styles.tooltipDate}>
              <Calendar size={11} />
              <span>{hoveredPoint.item.date}</span>
            </div>
            <div className={styles.tooltipRevenue}>
              {formatCurrency(Number(hoveredPoint.item.revenue))}
            </div>
            <div className={styles.tooltipOrders}>
              {hoveredPoint.item.ordersCount} đơn hàng
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
