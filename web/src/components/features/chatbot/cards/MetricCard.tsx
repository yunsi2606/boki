'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle } from 'lucide-react';
import styles from '../styles/cards.module.css';

interface MetricCardProps {
  data: Record<string, any>;
}

export default function MetricCard({ data }: MetricCardProps) {
  if (!data) return null;

  return (
    <div className={styles.metricCard}>
      {data.revenueToday !== undefined && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Doanh thu hôm nay</div>
          <div className={styles.metricValue}>
            {Number(data.revenueToday).toLocaleString('vi-VN')} ₫
          </div>
          {data.vsYesterdayPct !== undefined && (
            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {data.vsYesterdayPct >= 0 ? (
                <span className={styles.metricBadgePositive}>
                  <TrendingUp size={13} style={{ display: 'inline', marginRight: '2px' }} />
                  +{Number(data.vsYesterdayPct).toFixed(1)}% so với hôm qua
                </span>
              ) : (
                <span className={styles.metricBadgeNegative}>
                  <TrendingDown size={13} style={{ display: 'inline', marginRight: '2px' }} />
                  {Number(data.vsYesterdayPct).toFixed(1)}% so với hôm qua
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {data.ordersCountToday !== undefined && (
        <div style={{ fontSize: '12px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
          Tổng số đơn: <strong>{data.ordersCountToday} đơn</strong>
          {data.aovToday !== undefined && (
            <span style={{ marginLeft: '12px' }}>
              AOV: <strong>{Number(data.aovToday).toLocaleString('vi-VN')} ₫</strong>
            </span>
          )}
        </div>
      )}

      {data.pending !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '6px' }}>
          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Chờ duyệt</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>{data.pending}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Đang giao</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0284c7' }}>{data.shipping}</div>
          </div>
        </div>
      )}
    </div>
  );
}
