import React from 'react';
import type { ActivityAnalytics } from '@/types/activity';
import { FunnelIcon, BookOpenIcon, BarChartIcon } from '@/components/ui/LineIcons';
import styles from './adminActivity.module.css';

interface ActivityFunnelCardProps {
  analytics: ActivityAnalytics | null;
}

export default function ActivityFunnelCard({ analytics }: ActivityFunnelCardProps) {
  const views = analytics?.viewBookCountToday || 0;
  const cart = analytics?.addToCartCountToday || 0;
  const checkout = analytics?.initiateCheckoutCountToday || 0;
  const orders = analytics?.placeOrderCountToday || 0;

  const maxVal = Math.max(views, 1);
  const cartPercent = Math.min(100, Math.round((cart / maxVal) * 100));
  const checkoutPercent = Math.min(100, Math.round((checkout / maxVal) * 100));
  const orderPercent = Math.min(100, Math.round((orders / maxVal) * 100));

  return (
    <div className={styles.funnelGrid}>
      {/* Funnel Progress */}
      <div className={styles.panelCard}>
        <h3 className={styles.panelTitle}>
          <FunnelIcon size={18} color="#2563eb" />
          <span>Phễu Chuyển Đổi Thương Mại Điện Tử (Hôm Nay)</span>
        </h3>

        <div className={styles.funnelSteps}>
          <div className={styles.funnelStep}>
            <div className={styles.funnelStepHeader}>
              <span className={styles.funnelStepLabel}>1. Xem chi tiết sách (Product Views)</span>
              <span className={styles.funnelStepCount}>{views.toLocaleString('vi-VN')} lượt (100%)</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} style={{ width: '100%', background: '#3b82f6' }} />
            </div>
          </div>

          <div className={styles.funnelStep}>
            <div className={styles.funnelStepHeader}>
              <span className={styles.funnelStepLabel}>2. Thêm vào giỏ hàng (Add to Cart)</span>
              <span className={styles.funnelStepCount}>
                {cart.toLocaleString('vi-VN')} lượt ({views > 0 ? cartPercent : 0}%)
              </span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${views > 0 ? cartPercent : 0}%`, background: '#f59e0b' }}
              />
            </div>
          </div>

          <div className={styles.funnelStep}>
            <div className={styles.funnelStepHeader}>
              <span className={styles.funnelStepLabel}>3. Bắt đầu thanh toán (Checkout Initiated)</span>
              <span className={styles.funnelStepCount}>
                {checkout.toLocaleString('vi-VN')} lượt ({views > 0 ? checkoutPercent : 0}%)
              </span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${views > 0 ? checkoutPercent : 0}%`, background: '#8b5cf6' }}
              />
            </div>
          </div>

          <div className={styles.funnelStep}>
            <div className={styles.funnelStepHeader}>
              <span className={styles.funnelStepLabel}>4. Đặt hàng thành công (Order Placed)</span>
              <span className={styles.funnelStepCount}>
                {orders.toLocaleString('vi-VN')} đơn ({views > 0 ? orderPercent : 0}%)
              </span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${views > 0 ? orderPercent : 0}%`, background: '#10b981' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Trends & Searches */}
      <div className={styles.panelCard}>
        <h3 className={styles.panelTitle}>
          <BarChartIcon size={18} color="#059669" />
          <span>Xu Hướng Người Dùng Quan Tâm</span>
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
            TOP TỪ KHÓA TÌM KIẾM:
          </span>
          {analytics?.topSearchKeywords && analytics.topSearchKeywords.length > 0 ? (
            <ul className={styles.rankingList}>
              {analytics.topSearchKeywords.map((kw, i) => (
                <li key={i} className={styles.rankingItem}>
                  <div>
                    <span className={styles.rankingTag}>#{i + 1}</span>
                    <span>{kw}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
              Chưa có dữ liệu tìm kiếm hôm nay
            </div>
          )}
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
            TOP SÁCH ĐƯỢC XEM NHIỀU:
          </span>
          {analytics?.topViewedBooks && analytics.topViewedBooks.length > 0 ? (
            <ul className={styles.rankingList}>
              {analytics.topViewedBooks.map((title, i) => (
                <li key={i} className={styles.rankingItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <span className={styles.rankingTag}>#{i + 1}</span>
                    <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {title}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
              Chưa có dữ liệu sách xem nhiều
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
