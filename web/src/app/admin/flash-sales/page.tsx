'use client';

import { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { flashSaleService } from '@/services/flashSaleService';
import type { FlashSale, FlashSaleStatus } from '@/types/flashSale';
import FlashSaleFormModal from '@/components/features/admin/flashSale/FlashSaleFormModal';
import styles from './flashSales.module.css';

export default function AdminFlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await flashSaleService.getAllAdminSales();
      setSales(data || []);
    } catch (err) {
      console.error('Failed to load flash sales', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleCreate = () => {
    setEditingSale(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chiến dịch "${name}"?`)) return;
    try {
      await flashSaleService.deleteFlashSale(id);
      loadSales();
    } catch {
      alert('Không thể xóa chiến dịch');
    }
  };

  const handleStatusChange = async (id: string, newStatus: FlashSaleStatus) => {
    try {
      await flashSaleService.updateStatus(id, newStatus);
      loadSales();
    } catch {
      alert('Không thể cập nhật trạng thái chiến dịch');
    }
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '--';
    const d = new Date(isoStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBadge = (status: FlashSaleStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className={`${styles.badge} ${styles.badgeActive}`}>
            <CheckCircle2 size={12} strokeWidth={2.5} /> Đang diễn ra
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className={`${styles.badge} ${styles.badgeScheduled}`}>
            <Clock size={12} strokeWidth={2.5} /> Sắp diễn ra
          </span>
        );
      case 'ENDED':
        return (
          <span className={`${styles.badge} ${styles.badgeEnded}`}>
            <AlertCircle size={12} strokeWidth={2.5} /> Đã kết thúc
          </span>
        );
      case 'CANCELLED':
        return (
          <span className={`${styles.badge} ${styles.badgeCancelled}`}>
            <XCircle size={12} strokeWidth={2.5} /> Đã hủy
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>
            <Zap size={24} color="#ee4d2d" strokeWidth={2.2} />
            Quản Lý Flash Sale Giờ Vàng
          </h1>
          <p className={styles.pageSubtitle}>
            Tạo và lên lịch các chương trình khuyến mãi chớp nhoáng với số lượng giới hạn
          </p>
        </div>

        <button type="button" onClick={handleCreate} className={styles.primaryBtn}>
          <Plus size={18} strokeWidth={2.5} />
          Tạo Chiến Dịch Mới
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>Đang tải danh sách chiến dịch...</div>
        ) : sales.length === 0 ? (
          <div className={styles.emptyState}>
            <Zap size={40} color="#cbd5e1" />
            <p>Chưa có chiến dịch Flash Sale nào được tạo.</p>
            <button type="button" onClick={handleCreate} className={styles.primaryBtn}>
              <Plus size={16} /> Tạo Ngay
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên chiến dịch</th>
                <th>Thời gian diễn ra</th>
                <th>Sản phẩm</th>
                <th>Đã bán / Giới hạn</th>
                <th>Trạng thái</th>
                <th style={{ width: 140 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{sale.name}</div>
                    {sale.description && (
                      <div style={{ fontSize: 12, color: '#64748b' }}>{sale.description}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(sale.startTime)}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>đến {formatDate(sale.endTime)}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{sale.totalItems}</span> đầu sách
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#ee4d2d' }}>
                      {sale.totalSoldQuantity}
                    </span>{' '}
                    / {sale.totalQuantityLimit}
                  </td>
                  <td>
                    <select
                      value={sale.status}
                      onChange={(e) =>
                        handleStatusChange(sale.id, e.target.value as FlashSaleStatus)
                      }
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <option value="SCHEDULED">Sắp diễn ra</option>
                      <option value="ACTIVE">Kích hoạt ngay</option>
                      <option value="ENDED">Kết thúc</option>
                      <option value="CANCELLED">Hủy bỏ</option>
                    </select>
                    <div style={{ marginTop: 4 }}>{renderBadge(sale.status)}</div>
                  </td>
                  <td>
                    <div className={styles.actionBtnGroup}>
                      <button
                        type="button"
                        onClick={() => handleEdit(sale)}
                        className={styles.iconBtn}
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sale.id, sale.name)}
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        title="Xóa chiến dịch"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <FlashSaleFormModal
          sale={editingSale}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            loadSales();
          }}
        />
      )}
    </div>
  );
}
