'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BlogEditorForm from '@/components/features/admin/blogs/BlogEditorForm';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import styles from '@/components/features/admin/blogs/adminBlogs.module.css';

export default function AdminEditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await blogService.getAdminBlogById(id);
        setBlog(data);
      } catch (err: any) {
        console.error('Failed to fetch blog for editing:', err);
        setError('Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Đang tải nội dung bài viết để chỉnh sửa...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ color: '#b91c1c', marginBottom: '8px' }}>Lỗi Tải Bài Viết</h3>
          <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>{error || 'Bài viết không tồn tại.'}</p>
          <Link href="/admin/blogs" className={styles.secondaryBtn}>
            &larr; Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return <BlogEditorForm initialBlog={blog} isEditing />;
}
