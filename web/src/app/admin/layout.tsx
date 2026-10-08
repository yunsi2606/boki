'use client';

import { useState, useEffect } from 'react';
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
import { Bot, Sparkles, Layers, HardDrive, Zap, Menu, X } from 'lucide-react';
import styles from './adminLayout.module.css';
import AdminChatbotWidget from '@/components/features/chatbot/admin/AdminChatbotWidget';

const navItems = [
  { name: 'Tổng quan', path: '/admin', icon: <BarChartIcon size={20} /> },
  { name: 'Quản lý sách', path: '/admin/books', icon: <BookOpenIcon size={20} /> },
  { name: 'Quản lý danh mục', path: '/admin/categories', icon: <Layers size={20} /> },
  { name: 'Quản lý bài viết', path: '/admin/blogs', icon: <FileTextIcon size={20} /> },
  { name: 'Quản lý đơn hàng', path: '/admin/orders', icon: <PackageIcon size={20} /> },
  { name: 'Mã giảm giá', path: '/admin/vouchers', icon: <TicketIcon size={20} /> },
  { name: 'Flash Sale Giờ Vàng', path: '/admin/flash-sales', icon: <Zap size={20} /> },
  { name: 'Dọn dẹp lưu trữ R2', path: '/admin/storage', icon: <HardDrive size={20} /> },
  { name: 'Nhật ký & Hành vi', path: '/admin/activity', icon: <ActivityIcon size={20} /> },
  { name: 'Động cơ gợi ý', path: '/admin/recommendations', icon: <Sparkles size={20} /> },
  { name: 'AI Chatbot Analytics', path: '/admin/chat-analytics', icon: <Bot size={20} /> },
  { name: 'Cấu hình trang chủ', path: '/admin/config', icon: <LayoutTemplateIcon size={20} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const isAuthorizedAdmin = user && (user.role === 'ADMIN' || user.role === 'SELLER');

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.spinnerWrapper}>
            <ClockIcon size={36} color="#EE4D2D" />
          </div>
          <p>Đang kiểm tra quyền truy cập Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAuthorizedAdmin) {
    return (
      <div className={styles.unauthorizedScreen}>
        <div className={styles.unauthorizedCard}>
          <div className={styles.lockIconBox}>
            <LockIcon size={36} color="#ef4444" />
          </div>
          <h2>Yêu Cầu Quyền Admin</h2>
          <p>
            Bạn cần đăng nhập tài khoản có phân quyền <strong>ADMIN</strong> hoặc <strong>SELLER</strong> để vào khu vực Quản trị BokiStore.
          </p>
          <div className={styles.unauthorizedActions}>
            <button onClick={() => router.push('/login')} className={styles.primaryAuthBtn}>
              Đăng nhập ngay
            </button>
            <Link href="/" className={styles.secondaryHomeBtn}>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoBadge}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="Boki Admin Logo" className={styles.logoImg} />
            </div>
            <span className={styles.logoText}>BOKI ADMIN</span>
          </Link>
          <button
            type="button"
            className={styles.closeDrawerBtn}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
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
            <button
              type="button"
              className={styles.menuToggleBtn}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} />
            </button>
            <h2 className={styles.headerTitle}>Hệ Thống Quản Trị BokiStore</h2>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.adminUser}>
              <div className={styles.adminAvatar}>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className={styles.adminInfo}>
                <span className={styles.adminName}>{user.displayName}</span>
                <span className={styles.adminRole}>{user.role}</span>
              </div>
              <button
                onClick={logout}
                title="Đăng xuất"
                className={styles.logoutBtn}
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
