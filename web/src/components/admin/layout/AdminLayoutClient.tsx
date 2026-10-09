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
import { Bot, Sparkles, Layers, HardDrive, Zap, Menu, X, LogOut, Calendar } from 'lucide-react';
import styles from '@/app/admin/adminLayout.module.css';
import AdminChatbotWidget from '@/components/features/chatbot/admin/AdminChatbotWidget';

const navItems = [
  { name: 'Tổng quan', path: '/admin', icon: <BarChartIcon size={20} /> },
  { name: 'Quản lý sách', path: '/admin/books', icon: <BookOpenIcon size={20} /> },
  { name: 'Quản lý danh mục', path: '/admin/categories', icon: <Layers size={20} /> },
  { name: 'Lịch phát hành', path: '/admin/schedule', icon: <Calendar size={20} /> },
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

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <div className={styles.accessDenied}>
        <div className={styles.accessDeniedCard}>
          <div className={styles.accessDeniedIconWrapper}>
            <LockIcon size={48} color="#EE4D2D" />
          </div>
          <h2>Truy Cập Bị Giới Hạn</h2>
          <p>Khu vực quản trị chỉ dành riêng cho Quản trị viên (Admin) hoặc Nhân viên Bán hàng (Seller).</p>
          <div className={styles.deniedActions}>
            <button onClick={() => router.push('/login')} className={styles.loginBtn}>
              Đăng nhập tài khoản Admin
            </button>
            <button onClick={() => router.push('/')} className={styles.homeBtn}>
              Về trang chủ Boki
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logo}>
            <span className={styles.logoBadge}>BOKI ADMIN</span>
          </Link>
          <button
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
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {user?.displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.displayName || 'Admin'}</span>
              <span className={styles.userRole}>{user?.role}</span>
            </div>
          </div>
          <div className={styles.footerActions}>
            <Link href="/" target="_blank" className={styles.storeLink} title="Xem trang bán hàng">
              <GlobeIcon size={18} />
            </Link>
            <button onClick={logout} className={styles.logoutBtn} title="Đăng xuất">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <button
            className={styles.hamburgerBtn}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Mở menu quản trị"
          >
            <Menu size={22} />
          </button>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbBrand}>BOKI</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>
              {navItems.find((item) => item.path === pathname)?.name || 'Quản trị'}
            </span>
          </div>
          <div className={styles.headerRight}>
            <Link href="/" target="_blank" className={styles.visitShopBtn}>
              <GlobeIcon size={16} />
              <span>Sàn Boki</span>
            </Link>
            <div className={styles.userBadge}>
              <span className={styles.badgeAvatar}>
                {user?.displayName?.charAt(0).toUpperCase() || 'A'}
              </span>
              <span className={styles.badgeName}>{user?.displayName || 'Admin'}</span>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>
          {children}
        </main>
      </div>

      <AdminChatbotWidget />
    </div>
  );
}
