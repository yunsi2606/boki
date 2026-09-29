'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RecommendationMetrics } from '@/types/recommendation';
import { recommendationService } from '@/services/recommendationService';
import RecommendationKpiCards from '@/components/features/admin/recommendations/RecommendationKpiCards';
import WidgetPerformanceTable from '@/components/features/admin/recommendations/WidgetPerformanceTable';
import RecomputeEnginePanel from '@/components/features/admin/recommendations/RecomputeEnginePanel';
import styles from './adminRecommendations.module.css';

export default function AdminRecommendationsPage() {
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await recommendationService.getMetrics(days);
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to load recommendation metrics:', err);
      setErrorMsg(err?.message || 'Không thể tải chỉ số hiệu quả gợi ý. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Hiệu Quả Động Cơ Gợi Ý (AI Recommendation Engine)</h1>
          <p className={styles.subtitle}>
            Theo dõi tỷ lệ chuyển đổi, CTR và điều khiển mô hình gợi ý cá nhân hóa & mua kèm
          </p>
        </div>

        <div className={styles.filterArea}>
          <span className={styles.filterLabel}>Khoảng thời gian:</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={styles.select}
          >
            <option value={7}>7 ngày gần nhất</option>
            <option value={14}>14 ngày gần nhất</option>
            <option value={30}>30 ngày gần nhất</option>
            <option value={90}>90 ngày gần nhất</option>
          </select>
        </div>
      </div>

      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      <RecomputeEnginePanel onRecomputed={loadMetrics} />

      {loading && !metrics ? (
        <div className={styles.loadingBox}>Đang tổng hợp dữ liệu phân tích gợi ý...</div>
      ) : metrics ? (
        <>
          <RecommendationKpiCards metrics={metrics} />
          <WidgetPerformanceTable metrics={metrics.widgetMetrics || []} />
        </>
      ) : null}
    </div>
  );
}
