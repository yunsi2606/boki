'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AdminGiveawayCampaign,
  CreateGiveawayPayload,
  adminGiveawayService,
} from '@/services/adminGiveawayService';
import AdminGiveawayCampaignModal from '@/components/admin/schedule/giveaway/AdminGiveawayCampaignModal';
import AdminGiveawayDrawModal from '@/components/admin/schedule/giveaway/AdminGiveawayDrawModal';
import AdminGiveawayEntriesModal from '@/components/admin/schedule/giveaway/AdminGiveawayEntriesModal';
import styles from './adminGiveawayPage.module.css';

export default function AdminGiveawayPage() {
  const [campaigns, setCampaigns] = useState<AdminGiveawayCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdminGiveawayCampaign | null>(null);

  const [drawCampaign, setDrawCampaign] = useState<AdminGiveawayCampaign | null>(null);
  const [entriesCampaign, setEntriesCampaign] = useState<AdminGiveawayCampaign | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await adminGiveawayService.getCampaigns(statusFilter, 0, 50);
      setCampaigns(res.content || []);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const handleSaveCampaign = async (payload: CreateGiveawayPayload) => {
    if (editingCampaign) {
      await adminGiveawayService.updateCampaign(editingCampaign.id, payload);
    } else {
      await adminGiveawayService.createCampaign(payload);
    }
    await fetchCampaigns();
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa sự kiện Give Away này không? Mọi lượt tham gia sẽ bị xóa.')) {
      return;
    }
    try {
      await adminGiveawayService.deleteCampaign(id);
      await fetchCampaigns();
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      alert('Không thể xóa sự kiện Give Away');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className={`${styles.statusBadge} ${styles.statusOpen}`}>Đang mở</span>;
      case 'DRAWN':
        return <span className={`${styles.statusBadge} ${styles.statusDrawn}`}>Đã quay số</span>;
      case 'UPCOMING':
        return <span className={`${styles.statusBadge} ${styles.statusUpcoming}`}>Sắp mở</span>;
      default:
        return <span className={`${styles.statusBadge} ${styles.statusClosed}`}>Đã đóng</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Quản Lý Manga Give Away</h1>
          <p className={styles.pageSubtitle}>
            Tạo sự kiện phát quà, quản lý lượt chọn số may mắn (100-999) và chốt giải thông minh theo 3 số cuối XSMB.
          </p>
        </div>
        <div className={styles.headerActionGroup}>
          <Link href="/admin/schedule" className={styles.backBtn}>
            ← Về Quản lý Lịch
          </Link>
          <button
            type="button"
            onClick={() => {
              setEditingCampaign(null);
              setIsFormModalOpen(true);
            }}
            className={styles.createBtn}
          >
            + Tạo sự kiện Give Away
          </button>
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.tabs}>
          {['ALL', 'OPEN', 'DRAWN', 'UPCOMING', 'CLOSED'].map((s) => (
            <button
              key={s}
              className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'OPEN' ? 'Đang mở' : s === 'DRAWN' ? 'Đã quay số' : s === 'UPCOMING' ? 'Sắp mở' : 'Đã đóng'}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: '#6B7280' }}>
          Tổng cộng: <strong>{campaigns.length}</strong> sự kiện
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên sự kiện</th>
              <th>Thời gian</th>
              <th style={{ textAlign: 'center' }}>Tham gia</th>
              <th style={{ textAlign: 'center' }}>Số trúng</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>Đang tải danh sách sự kiện...</td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>Chưa có sự kiện nào. Hãy bấm nút tạo sự kiện ở trên!</td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Slug: /giveaway/{c.slug}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    <div>Bắt đầu: {new Date(c.startDate).toLocaleDateString('vi-VN')}</div>
                    <div>Kết thúc: {new Date(c.endDate).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>
                    {c.totalEntriesCount || 0}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {c.winningNumber !== undefined && c.winningNumber !== null ? (
                      <strong style={{ color: '#D97706', fontSize: 16 }}>{c.winningNumber}</strong>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{getStatusBadge(c.status)}</td>
                  <td>
                    <div className={styles.actionGroup} style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setDrawCampaign(c)}
                        className={styles.drawBtn}
                      >
                        {c.status === 'DRAWN' ? 'Xem lại quay số' : 'Quay số & Chốt giải'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEntriesCampaign(c)}
                        className={styles.entriesBtn}
                      >
                        Lượt tham gia
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCampaign(c);
                          setIsFormModalOpen(true);
                        }}
                        className={styles.editBtn}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCampaign(c.id)}
                        className={styles.deleteBtn}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminGiveawayCampaignModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveCampaign}
        campaign={editingCampaign}
      />

      {drawCampaign && (
        <AdminGiveawayDrawModal
          isOpen={true}
          onClose={() => setDrawCampaign(null)}
          campaign={drawCampaign}
          onDrawSuccess={fetchCampaigns}
        />
      )}

      {entriesCampaign && (
        <AdminGiveawayEntriesModal
          isOpen={true}
          onClose={() => setEntriesCampaign(null)}
          campaign={entriesCampaign}
        />
      )}
    </div>
  );
}
