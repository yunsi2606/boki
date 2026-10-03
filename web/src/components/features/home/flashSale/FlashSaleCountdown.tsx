'use client';

import { useState, useEffect } from 'react';
import styles from './FlashSaleCountdown.module.css';

interface FlashSaleCountdownProps {
  initialSeconds: number;
  onExpire?: () => void;
}

export default function FlashSaleCountdown({
  initialSeconds,
  onExpire,
}: FlashSaleCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={styles.countdownWrapper}>
      <span className={styles.countdownLabel}>Kết thúc trong:</span>
      <div className={styles.timeBox}>
        <span className={styles.timeValue}>{pad(hours)}</span>
      </div>
      <span className={styles.colon}>:</span>
      <div className={styles.timeBox}>
        <span className={styles.timeValue}>{pad(minutes)}</span>
      </div>
      <span className={styles.colon}>:</span>
      <div className={styles.timeBox}>
        <span className={styles.timeValue}>{pad(seconds)}</span>
      </div>
    </div>
  );
}
