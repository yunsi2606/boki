'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import type { HeroBannerConfig } from '@/config/homepageConfig';
import styles from './HeroBanner.module.css';

interface HeroBannerProps {
  config: HeroBannerConfig;
}

export default function HeroBanner({ config }: HeroBannerProps) {
  const cards = config.sideCards || [];

  return (
    <section className={styles.heroSection}>
      <div className="container">
        <div className={styles.bentoGrid}>
          {/* Main Featured Promo Banner with Image Background */}
          <div
            className={styles.bentoMain}
            style={{ backgroundImage: `url(${config.bannerImage})` }}
          >
            <div className={styles.bannerOverlay}>
              <span className={styles.heroTag}>{config.tag}</span>
              <h1 className={styles.heroTitle}>
                {config.title}{' '}
                <span className={styles.priceHighlight}>{config.highlightText}</span>
              </h1>
              <p className={styles.heroSubtitle}>{config.subtitle}</p>

              <div className={styles.heroTimerBox}>
                <span>⏰ Kết thúc sau:</span>
                <div className={styles.timerPills}>
                  <span className={styles.timerNum}>08</span>:
                  <span className={styles.timerNum}>42</span>:
                  <span className={styles.timerNum}>19</span>
                </div>
              </div>

              <div className={styles.heroActions}>
                <Link href={config.primaryCtaLink}>
                  <Button size="lg">{config.primaryCtaText}</Button>
                </Link>
                <Link href={config.secondaryCtaLink}>
                  <Button variant="secondary" size="lg">
                    {config.secondaryCtaText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Dynamic Side Cards List */}
          <div className={styles.sideCardsColumn}>
            {cards.map((card) => {
              if (card.type === 'publishers' || card.publishers?.length) {
                return (
                  <div key={card.id} className={styles.bentoCardSide2}>
                    <h4 className={styles.publisherTitle}>{card.title}</h4>
                    <div className={styles.publisherChips}>
                      {(card.publishers || []).map((pub, idx) => (
                        <span key={idx} className={styles.chip}>
                          {pub}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={card.id}
                  className={styles.bentoCardSide1}
                  style={card.image ? { backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,249,219,0.95) 100%), url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                  {card.badge && <div className={styles.sideCardBadge}>{card.badge}</div>}
                  <div>
                    <h3 className={styles.sideCardTitle}>{card.title}</h3>
                    {card.description && <p className={styles.sideCardDesc}>{card.description}</p>}
                  </div>
                  {card.link && (
                    <Link href={card.link} className={styles.sideCardLink}>
                      Khám phá ngay &rarr;
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

