'use client';

import Link from 'next/link';
import styles from './CategoryCircles.module.css';

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  gradient: string;
}

const defaultCategories: CategoryItem[] = [
  { id: 'c1', name: 'Sách Văn học', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #FF6B52 0%, #EE4D2D 100%)' },
  { id: 'c2', name: 'Sách Thiếu nhi', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' },
  { id: 'c3', name: 'Sách Kinh tế', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #FF6B81 0%, #E84E66 100%)' },
  { id: 'c4', name: 'Sách Giáo khoa', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #20C997 0%, #0CA678 100%)' },
  { id: 'c5', name: 'Kỹ Năng Sống', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #1E90FF 0%, #0066CC 100%)' },
  { id: 'c6', name: 'Phát triển bản thân', image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #7950F2 0%, #5F3DC4 100%)' },
  { id: 'c7', name: 'Sổ tay & Quà tặng', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=150&h=150', gradient: 'linear-gradient(135deg, #FCC419 0%, #F59F00 100%)' }
];

export default function CategoryCircles({ items = defaultCategories }: { items?: CategoryItem[] }) {
  return (
    <section className={styles.categoriesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Danh Mục Sản Phẩm</h2>
        </div>
        <div className={styles.categoriesWrapper}>
          {items.map((cat) => (
            <Link href={`/books?category=${cat.id}`} key={cat.id} className={styles.categoryItem}>
              <div className={styles.categoryRing} style={{ background: cat.gradient }}>
                <div className={styles.categoryCircle}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={styles.categoryImage}
                    loading="lazy"
                  />
                </div>
              </div>
              <span className={styles.categoryName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
