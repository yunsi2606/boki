'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Zap, ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react';
import { flashSaleService } from '@/services/flashSaleService';
import { bookService } from '@/services/bookService';
import { useCart } from '@/hooks/useCart';
import type { PublicFlashSale } from '@/types/flashSale';
import type { HomepageSectionConfig } from '@/config/homepageConfig';
import FlashSaleCard from './FlashSaleCard';
import FlashSaleCountdown from './FlashSaleCountdown';
import styles from './FlashSaleSection.module.css';

interface FlashSaleSectionProps {
  section?: HomepageSectionConfig;
  onShowNotification?: (msg: string) => void;
}

export default function FlashSaleSection({
  section,
  onShowNotification,
}: FlashSaleSectionProps) {
  const { addToCart } = useCart();
  const [sale, setSale] = useState<PublicFlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSale() {
      try {
        const data = await flashSaleService.getActiveFlashSale();
        setSale(data);
      } catch (err) {
        console.error('Failed to load flash sale', err);
      } finally {
        setLoading(false);
      }
    }
    loadSale();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -420 : 420;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = async (bookId: string) => {
    try {
      const book = await bookService.getBook(bookId);
      if (book) {
        addToCart(book, 1);
        onShowNotification?.(`Đã thêm "${book.title}" vào giỏ hàng với giá Flash Sale!`);
      }
    } catch {
      onShowNotification?.('Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  // If loading or no active flash sale, don't show or show placeholder only if configured
  if (loading) {
    return null;
  }

  if (!sale || !sale.items || sale.items.length === 0) {
    return null;
  }

  const title = section?.title || sale.name || 'Flash Sale Giờ Vàng';

  return (
    <section className={styles.sectionWrapper} id="flash-sale-section">
      <div className={styles.cardContainer}>
        <div className={styles.topAccentLine} />

        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}>
                <Zap size={22} strokeWidth={2.2} />
              </div>
              <h2 className={styles.sectionTitle}>{title}</h2>
            </div>

            {sale.remainingSeconds > 0 && (
              <FlashSaleCountdown
                initialSeconds={sale.remainingSeconds}
                onExpire={() => setSale(null)}
              />
            )}
          </div>

          <div className={styles.headerControls}>
            <div className={styles.sliderArrows}>
              <button
                type="button"
                className={styles.arrowBtn}
                onClick={() => handleScroll('left')}
                aria-label="Cuộn trái"
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                className={styles.arrowBtn}
                onClick={() => handleScroll('right')}
                aria-label="Cuộn phải"
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {section?.showViewAll && (
              <Link href={section.viewAllUrl || '/books'} className={styles.viewAllLink}>
                Xem tất cả
                <ArrowRight size={14} strokeWidth={2.2} />
              </Link>
            )}
          </div>
        </div>

        <div className={styles.scrollArea} ref={scrollRef}>
          {sale.items.map((item) => (
            <FlashSaleCard
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
