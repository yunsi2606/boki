'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { BookCardData } from '@/types/chat';
import styles from '../styles/cards.module.css';

interface CompareCardProps {
  books: BookCardData[];
}

export default function CompareCard({ books }: CompareCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  if (!books || books.length < 2) return null;

  return (
    <div style={{ overflowX: 'auto', width: '100%', marginTop: '6px' }}>
      <table className={styles.compareTable}>
        <thead>
          <tr>
            <th>Tiêu chí</th>
            {books.map((b) => (
              <th key={b.id} style={{ minWidth: '120px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.title}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600, color: '#64748b' }}>Giá bán</td>
            {books.map((b) => (
              <td key={b.id} style={{ fontWeight: 700, color: '#EE4D2D' }}>
                {Number(b.price).toLocaleString('vi-VN')} ₫
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ fontWeight: 600, color: '#64748b' }}>Tác giả</td>
            {books.map((b) => (
              <td key={b.id}>{b.author}</td>
            ))}
          </tr>
          <tr>
            <td style={{ fontWeight: 600, color: '#64748b' }}>Đánh giá</td>
            {books.map((b) => (
              <td key={b.id}>{b.rating ? `${b.rating} ⭐` : '5.0 ⭐'}</td>
            ))}
          </tr>
          <tr>
            <td style={{ fontWeight: 600, color: '#64748b' }}>Tình trạng kho</td>
            {books.map((b) => (
              <td key={b.id}>
                {b.stock > 0 ? (
                  <span style={{ color: '#16a34a' }}>Còn hàng ({b.stock})</span>
                ) : (
                  <span style={{ color: '#dc2626' }}>Hết hàng</span>
                )}
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ fontWeight: 600, color: '#64748b' }}>Thao tác</td>
            {books.map((b) => (
              <td key={b.id}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    const dummyBook = {
                      id: b.id,
                      title: b.title,
                      price: b.price,
                      originalPrice: b.originalPrice,
                      stockQuantity: b.stock || 99,
                      images: b.coverUrl ? [{ imageUrl: b.coverUrl, isPrimary: true }] : [],
                      sellerId: 'system',
                      author: b.author,
                      condition: 'NEW' as const,
                      status: 'ACTIVE' as const,
                      currency: 'VND',
                      viewsCount: 0,
                      rating: b.rating || 5,
                      reviewsCount: 0,
                      isPreOrder: b.isPreOrder || false
                    };
                    addToCart(dummyBook as any, 1);
                  }}
                >
                  <ShoppingCart size={11} />
                  Mua
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
