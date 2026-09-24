'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChartIcon,
  BookOpenIcon,
  PackageIcon,
  TicketIcon,
  LayoutTemplateIcon,
  ClockIcon,
  LockIcon,
  GlobeIcon,
  ActivityIcon,
  FileTextIcon,
} from '@/components/ui/LineIcons';
import styles from './adminLayout.module.css';

const navItems = [
  { name: 'Tổng quan', path: '/admin', icon: <BarChartIcon size={20} /> },
  { name: 'Quản lý sách', path: '/admin/books', icon: <BookOpenIcon size={20} /> },
  { name: 'Quản lý bài viết', path: '/admin/blogs', icon: <FileTextIcon size={20} /> },
  { name: 'Quản lý đơn hàng', path: '/admin/orders', icon: <PackageIcon size={20} /> },
  { name: 'Mã giảm giá', path: '/admin/vouchers', icon: <TicketIcon size={20} /> },
  { name: 'Nhật ký & Hành vi', path: '/admin/activity', icon: <ActivityIcon size={20} /> },
  { name: 'Cấu hình trang chủ', path: '/admin/config', icon: <LayoutTemplateIcon size={20} /> },
];

import AdminChatbotWidget from '@/components/features/chatbot/admin/AdminChatbotWidget';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const isAuthorizedAdmin = user && (user.role === 'ADMIN' || user.role === 'SELLER');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', animation: 'spin 1.5s linear infinite' }}>
            <ClockIcon size={36} color="#6366f1" />
          </div>
          <p style={{ fontWeight: 500 }}>Đang kiểm tra quyền truy cập Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorizedAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', maxWidth: '460px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LockIcon size={36} color="#ef4444" />
            </div>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>Yêu Cầu Quyền Admin</h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
            Bạn cần đăng nhập tài khoản có phân quyền <strong>ADMIN</strong> hoặc <strong>SELLER</strong> để vào khu vực Quản trị BokiStore.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}
            >
              Đăng nhập ngay
            </button>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#f1f5f9',
                color: '#475569',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoBadge}>
              <img src="/brand/logo.png" alt="Boki Admin Logo" className={styles.logoImg} />
            </div>
            <span className={styles.logoText}>BOKI ADMIN</span>
          </Link>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navName}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.storefrontBtn}>
            <GlobeIcon size={18} />
            <span>Xem Cửa hàng</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Wrapper */}
      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.headerTitle}>Hệ Thống Quản Trị BokiStore</h2>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.adminUser}>
              <div className={styles.adminAvatar}>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}</div>
              <div className={styles.adminInfo}>
                <span className={styles.adminName}>{user.displayName}</span>
                <span className={styles.adminRole}>{user.role}</span>
              </div>
              <button
                onClick={logout}
                title="Đăng xuất"
                style={{ marginLeft: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#ef4444' }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>{children}</main>
        <AdminChatbotWidget />
      </div>
    </div>
  );
}
