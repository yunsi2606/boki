'use client';

import React, { useState } from 'react';
import { Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';
import { recommendationService } from '@/services/recommendationService';
import styles from './RecomputeEnginePanel.module.css';

interface Props {
  onRecomputed?: () => void;
}

export default function RecomputeEnginePanel({ onRecomputed }: Props) {
  const [recomputing, setRecomputing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleRecompute = async () => {
    try {
      setRecomputing(true);
      setStatusMsg(null);
      const res = await recommendationService.recomputeModels();
      setStatusMsg(res || 'Đã kích hoạt tính toán lại thành công!');
      if (onRecomputed) {
        onRecomputed();
      }
    } catch {
      setStatusMsg('Có lỗi xảy ra khi yêu cầu tính toán lại mô hình.');
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.leftArea}>
        <div className={styles.iconWrapper}>
          <Cpu size={24} />
        </div>
        <div>
          <h4 className={styles.title}>Huấn Luyện & Tính Toán Lại Mô Hình (Model Recomputation)</h4>
          <p className={styles.desc}>
            Mô hình tự động chạy định kỳ lúc 03:00 sáng mỗi ngày. Bạn có thể kích hoạt tính toán ngay lập tức
            để cập nhật tương đồng nội dung và ma trận đồng xuất hiện đơn hàng mới nhất.
          </p>
        </div>
      </div>

      <div className={styles.rightArea}>
        {statusMsg && (
          <span className={styles.statusText}>
            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            {statusMsg}
          </span>
        )}
        <button
          type="button"
          onClick={handleRecompute}
          disabled={recomputing}
          className={styles.actionBtn}
        >
          <RefreshCw size={15} className={recomputing ? styles.spin : ''} />
          {recomputing ? 'Đang tính toán...' : 'Tính toán lại ngay'}
        </button>
      </div>
    </div>
  );
}
