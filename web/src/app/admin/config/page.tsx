'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { defaultHomepageConfig, type HomepageConfig, type SideCardConfig } from '@/config/homepageConfig';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
import HeroBanner from '@/components/features/home/HeroBanner';
import CarrierConfigTab from '@/components/features/admin/config/CarrierConfigTab';
import PaymentConfigTab from '@/components/features/admin/config/PaymentConfigTab';
import StoreGeneralTab from '@/components/features/admin/config/StoreGeneralTab';
import FraudAutopilotConfigTab from '@/components/features/admin/config/FraudAutopilotConfigTab';
import styles from './adminConfig.module.css';

export default function AdminConfigPage() {
  const [activeTab, setActiveTab] = useState<'CARRIERS' | 'PAYMENTS' | 'AUTOPILOT' | 'HOMEPAGE' | 'GENERAL'>('CARRIERS');
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await adminService.getStoreConfig();
        // Ensure sideCards is initialized
        if (!data.hero.sideCards || data.hero.sideCards.length === 0) {
          data.hero.sideCards = defaultHomepageConfig.hero.sideCards;
        }
        setConfig(data);
      } catch (err) {
        console.error('Failed to load store config', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.updateStoreConfig(config);
    showNotice('✨ Cấu hình giao diện đã được lưu thành công! Giao diện trang chủ sẽ tự động cập nhật.');
  };

  // Card Reordering Controls
  const moveCard = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= config.hero.sideCards.length) return;
    const updated = [...config.hero.sideCards];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setConfig({
      ...config,
      hero: { ...config.hero, sideCards: updated },
    });
  };

  const handleAddCard = (type: 'spotlight' | 'publishers') => {
    const newCard: SideCardConfig =
      type === 'spotlight'
        ? {
          id: `sc_${Date.now()}`,
          type: 'spotlight',
          badge: '🔥 HOT DEALS',
          title: 'Tiêu đề thẻ mới',
          description: 'Mô tả chi tiết ưu đãi hoặc quà tặng kèm...',
          image: '',
          link: '/books',
        }
        : {
          id: `sc_${Date.now()}`,
          type: 'publishers',
          title: '🏢 NXB HỢP TÁC MỚI',
          publishers: ['AZ VIỆT NAM', 'KIM ĐỒNG', 'NHÃ NAM'],
        };

    setConfig({
      ...config,
      hero: { ...config.hero, sideCards: [...config.hero.sideCards, newCard] },
    });
  };

  const handleRemoveCard = (id: string) => {
    if (config.hero.sideCards.length <= 1) {
      alert('Phải giữ lại ít nhất 1 thẻ Side Card.');
      return;
    }
    setConfig({
      ...config,
      hero: {
        ...config.hero,
        sideCards: config.hero.sideCards.filter((c) => c.id !== id),
      },
    });
  };

  const handleUpdateCard = (id: string, updatedFields: Partial<SideCardConfig>) => {
    setConfig({
      ...config,
      hero: {
        ...config.hero,
        sideCards: config.hero.sideCards.map((c) =>
          c.id === id ? { ...c, ...updatedFields } : c
        ),
      },
    });
  };

  // Drag and Drop HTML5
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveCard(draggedIndex, index);
    setDraggedIndex(index);
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải cấu hình giao diện...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {activeTab === 'CARRIERS' && 'Cấu Hình Đơn Vị Vận Chuyển'}
            {activeTab === 'PAYMENTS' && 'Cấu Hình Cổng Thanh Toán Trực Tuyến'}
            {activeTab === 'AUTOPILOT' && 'Cấu Hình Fraud Detection & Autopilot Duyệt Đơn'}
            {activeTab === 'HOMEPAGE' && 'Cấu Hình Trang Chủ & Hero Banner'}
            {activeTab === 'GENERAL' && 'Cấu Hình Cửa Hàng & Kho Xuất Hàng'}
          </h1>
          <p className={styles.pageSubtitle}>
            {activeTab === 'CARRIERS' && 'Bật/tắt 6 đối tác vận chuyển (SPX, J&T, GHN, GHTK, Viettel Post, VNPost), cước phí & API'}
            {activeTab === 'PAYMENTS' && 'Quản lý tài khoản SePay VietQR, MoMo Gateway, VNPay & thử nghiệm Webhook IPN'}
            {activeTab === 'AUTOPILOT' && 'Thiết lập thuật toán nhận diện rủi ro AI, ngưỡng cảnh báo giọng nói & quy trình tự động duyệt đơn'}
            {activeTab === 'HOMEPAGE' && 'Chỉnh sửa nội dung banner, kéo thả sắp xếp Side Cards & tải ảnh trực tiếp'}
            {activeTab === 'GENERAL' && 'Tên cửa hàng, hotline hỗ trợ, email và địa chỉ kho gửi in trên vận đơn'}
          </p>
        </div>
        {activeTab === 'HOMEPAGE' && (
          <button onClick={handleSubmit} className={styles.saveBtnTop}>
            💾 Lưu Banner
          </button>
        )}
      </div>

      {noticeMessage && (
        <div className={styles.alertSuccess}>
          {noticeMessage}
        </div>
      )}

      {/* Configuration Hub Tabs */}
      <div className={styles.configTabs}>
        <button
          type="button"
          className={`${styles.configTabBtn} ${activeTab === 'CARRIERS' ? styles.configTabActive : ''}`}
          onClick={() => setActiveTab('CARRIERS')}
        >
          <span>Đơn Vị Vận Chuyển</span>
        </button>
        <button
          type="button"
          className={`${styles.configTabBtn} ${activeTab === 'PAYMENTS' ? styles.configTabActive : ''}`}
          onClick={() => setActiveTab('PAYMENTS')}
        >
          <span>Cổng Thanh Toán</span>
        </button>
        <button
          type="button"
          className={`${styles.configTabBtn} ${activeTab === 'AUTOPILOT' ? styles.configTabActive : ''}`}
          onClick={() => setActiveTab('AUTOPILOT')}
        >
          <span>🤖 AI & Autopilot</span>
        </button>
        <button
          type="button"
          className={`${styles.configTabBtn} ${activeTab === 'HOMEPAGE' ? styles.configTabActive : ''}`}
          onClick={() => setActiveTab('HOMEPAGE')}
        >
          <span>Giao Diện & Banner</span>
        </button>
        <button
          type="button"
          className={`${styles.configTabBtn} ${activeTab === 'GENERAL' ? styles.configTabActive : ''}`}
          onClick={() => setActiveTab('GENERAL')}
        >
          <span>Cài Đặt Chung</span>
        </button>
      </div>

      {activeTab === 'CARRIERS' && <CarrierConfigTab onSuccessNotice={showNotice} />}

      {activeTab === 'PAYMENTS' && <PaymentConfigTab onSuccessNotice={showNotice} />}

      {activeTab === 'AUTOPILOT' && <FraudAutopilotConfigTab onSuccessNotice={showNotice} />}

      {activeTab === 'GENERAL' && <StoreGeneralTab onSuccessNotice={showNotice} />}

      {activeTab === 'HOMEPAGE' && (
        <>
          {/* Live Interactive Preview */}
          <div className={styles.previewSection}>
            <div className={styles.previewSectionHeader}>
              <span>👁️ XEM TRƯỚC THỜI GIAN THỰC (LIVE PREVIEW)</span>
            </div>
            <div className={styles.previewBox}>
              <HeroBanner config={config.hero} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.formLayout}>
            {/* Section 1: Hero Banner Main Content */}
            <div className={styles.configCard}>
              <div className={styles.cardTitleRow}>
                <div className={styles.cardTitleLeft}>
                  <span className={styles.cardIcon}>🖼️</span>
                  <div>
                    <h2>Hero Banner Main (Ảnh Nền & Tiêu Đề)</h2>
                    <p>Upload ảnh nền high-res và các đoạn text hiển thị chính</p>
                  </div>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <ImageUploadInput
                    label="Hình Ảnh Banner Nền (Banner Background Image)"
                    value={config.hero.bannerImage}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, bannerImage: url },
                      })
                    }
                    placeholder="Kéo thả hoặc chọn file ảnh banner nền từ máy tính..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Thẻ Nhãn (Tagline)</label>
                  <input
                    type="text"
                    value={config.hero.tag}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, tag: e.target.value },
                      })
                    }
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tiêu Đề (Title)</label>
                  <input
                    type="text"
                    value={config.hero.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, title: e.target.value },
                      })
                    }
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Text Nổi Bật (Highlight Text)</label>
                  <input
                    type="text"
                    value={config.hero.highlightText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, highlightText: e.target.value },
                      })
                    }
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Thời gian đếm ngược Flash Sale (Giờ)</label>
                  <input
                    type="number"
                    value={config.hero.timerEndHours}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, timerEndHours: parseInt(e.target.value) || 1 },
                      })
                    }
                    className={styles.formInput}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Đoạn Mô Tả (Subtitle)</label>
                  <textarea
                    rows={3}
                    value={config.hero.subtitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, subtitle: e.target.value },
                      })
                    }
                    className={styles.formTextarea}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Reorderable Side Cards Manager */}
            <div className={styles.configCard}>
              <div className={styles.cardTitleRow}>
                <div className={styles.cardTitleLeft}>
                  <span className={styles.cardIcon}>🎛️</span>
                  <div>
                    <h2>Thẻ Nổi Bật Bên Cạnh Hero (Kéo Thả Bố Cục Dynamic Side Cards)</h2>
                    <p>Thêm, xóa, tải ảnh đại diện và kéo thả sắp xếp vị trí các thẻ side card</p>
                  </div>
                </div>

                <div className={styles.addCardActions}>
                  <button
                    type="button"
                    onClick={() => handleAddCard('spotlight')}
                    className={styles.addBtn}
                  >
                    + Thêm Thẻ Spotlight Ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddCard('publishers')}
                    className={styles.addBtn}
                  >
                    + Thêm Thẻ NXB Đối Tác
                  </button>
                </div>
              </div>

              <div className={styles.cardsList}>
                {config.hero.sideCards.map((card, idx) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    className={styles.draggableCardItem}
                  >
                    <div className={styles.cardHeaderBar}>
                      <div className={styles.dragHandle}>
                        <span>≡ Kéo thả vị trí #{idx + 1}</span>
                        <span>({card.type === 'spotlight' ? 'Thẻ Spotlight' : 'Thẻ Danh sách NXB'})</span>
                      </div>

                      <div className={styles.cardOrderControls}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveCard(idx, idx - 1)}
                          className={styles.orderBtn}
                          title="Di chuyển lên"
                        >
                          ▲ Lên
                        </button>
                        <button
                          type="button"
                          disabled={idx === config.hero.sideCards.length - 1}
                          onClick={() => moveCard(idx, idx + 1)}
                          className={styles.orderBtn}
                          title="Di chuyển xuống"
                        >
                          ▼ Xuống
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(card.id)}
                          className={styles.deleteCardBtn}
                        >
                          ✕ Xóa thẻ
                        </button>
                      </div>
                    </div>

                    {card.type !== 'publishers' ? (
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label>Nhãn Badge (VD: ✨ BẢN ĐẶC BIỆT)</label>
                          <input
                            type="text"
                            value={card.badge || ''}
                            onChange={(e) => handleUpdateCard(card.id, { badge: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Tiêu Đề Thẻ</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                          <label>Mô Tả Chi Tiết / Quà Tặng Kèm</label>
                          <input
                            type="text"
                            value={card.description || ''}
                            onChange={(e) => handleUpdateCard(card.id, { description: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Đường Dẫn Click (Link)</label>
                          <input
                            type="text"
                            value={card.link || ''}
                            onChange={(e) => handleUpdateCard(card.id, { link: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <ImageUploadInput
                            label="Upload Hình Ảnh Đại Diện Cho Thẻ"
                            value={card.image || ''}
                            onChange={(url) => handleUpdateCard(card.id, { image: url })}
                            placeholder="Chọn ảnh đại diện thẻ side card..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label>Tiêu Đề Khối NXB</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                          <label>Danh Sách NXB Hợp Tác (Phân cách bằng dấu phẩy)</label>
                          <input
                            type="text"
                            value={(card.publishers || []).join(', ')}
                            onChange={(e) =>
                              handleUpdateCard(card.id, {
                                publishers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            className={styles.formInput}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                💾 Hoàn Tất & Lưu Bố Cục Trang Chủ
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

