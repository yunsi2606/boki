'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import styles from '@/components/features/admin/blogs/adminBlogs.module.css';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await blogService.getAdminBlogs(search || undefined);
      setBlogs(data || []);
    } catch (err: any) {
      console.error('Failed to load admin blogs:', err);
      setErrorMsg(err?.message || 'Không thể tải danh sách bài viết. Vui lòng kiểm tra quyền truy cập hoặc thử lại.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBlogs]);

  const handleToggleFeatured = async (id: string) => {
    try {
      const updated = await blogService.toggleFeatured(id);
      setBlogs((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await blogService.changeStatus(id, newStatus);
      setBlogs((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?\nCác hình ảnh liên quan trên R2 sẽ được tự động dọn dẹp.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await blogService.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete blog:', err);
      alert('Xóa bài viết thất bại. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const publishedCount = blogs.filter((b) => b.status === 'PUBLISHED').length;
  const draftCount = blogs.filter((b) => b.status === 'DRAFT').length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Quản lý Bài Viết & Blog</h1>
          <p>Tạo mới, chỉnh sửa, xuất bản bài viết và quản lý nội dung số của cửa hàng.</p>
        </div>
        <Link href="/admin/blogs/new" className={styles.primaryBtn}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Viết bài mới
        </Link>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statsRow}>
          <span>Tổng số: <strong>{blogs.length}</strong></span>
          <span>Đã xuất bản: <strong style={{ color: '#16a34a' }}>{publishedCount}</strong></span>
          <span>Bản nháp: <strong style={{ color: '#d97706' }}>{draftCount}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {errorMsg ? (
          <div className={styles.emptyState} style={{ color: '#b91c1c' }}>
            <h3>Lỗi tải danh sách bài viết</h3>
            <p style={{ marginTop: '8px', color: '#64748b' }}>{errorMsg}</p>
            <button
              type="button"
              onClick={() => fetchBlogs()}
              className={styles.secondaryBtn}
              style={{ marginTop: '16px' }}
            >
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className={styles.emptyState}>
            <p>Đang tải danh sách bài viết...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Chưa có bài viết nào</h3>
            <p style={{ marginTop: '8px' }}>
              {search ? 'Không tìm thấy bài viết phù hợp với từ khóa.' : 'Hãy bắt đầu tạo bài viết đầu tiên cho blog của bạn.'}
            </p>
            {!search && (
              <Link href="/admin/blogs/new" className={styles.primaryBtn} style={{ marginTop: '16px' }}>
                + Viết bài mới ngay
              </Link>
            )}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Bài viết</th>
                <th>Chuyên mục</th>
                <th>Trạng thái</th>
                <th>Nổi bật</th>
                <th>Lượt xem</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    <div className={styles.postCell}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={blog.effectiveCoverImage || '/images/default-blog-cover.png'}
                        alt={blog.title}
                        className={styles.postThumbnail}
                      />
                      <div className={styles.postInfo}>
                        <Link href={`/admin/blogs/${blog.id}`} className={styles.postTitle}>
                          {blog.title}
                        </Link>
                        <div className={styles.postMeta}>
                          <span>bởi {blog.authorName}</span>
                          <span>•</span>
                          <span>{blog.readingTimeMinutes} phút đọc</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>{blog.category}</span>
                  </td>
                  <td>
                    <select
                      value={blog.status}
                      onChange={(e) => handleStatusChange(blog.id, e.target.value)}
                      className={styles.select}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        width: 'auto',
                        borderColor: blog.status === 'PUBLISHED' ? '#86efac' : '#fde68a',
                        background: blog.status === 'PUBLISHED' ? '#f0fdf4' : '#fffbeb',
                        color: blog.status === 'PUBLISHED' ? '#166534' : '#92400e',
                      }}
                    >
                      <option value="DRAFT">Bản nháp</option>
                      <option value="PUBLISHED">Đã xuất bản</option>
                      <option value="ARCHIVED">Lưu trữ</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.featuredBtn} ${blog.isFeatured ? styles.featuredBtnActive : ''}`}
                      onClick={() => handleToggleFeatured(blog.id)}
                      title={blog.isFeatured ? 'Hủy đánh dấu nổi bật' : 'Đánh dấu nổi bật'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={blog.isFeatured ? '#f59e0b' : 'none'} stroke={blog.isFeatured ? '#f59e0b' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{blog.viewsCount.toLocaleString()}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                      {blog.status === 'PUBLISHED' && (
                        <Link
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          className={styles.actionBtn}
                          title="Xem trên web"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      )}
                      <Link
                        href={`/admin/blogs/${blog.id}`}
                        className={styles.actionBtn}
                        title="Chỉnh sửa"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </Link>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDelete(blog.id, blog.title)}
                        disabled={deletingId === blog.id}
                        title="Xóa bài viết (tự động dọn rác R2)"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
