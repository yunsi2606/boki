'use client';

import React from 'react';
import styles from './trioCoverBadge.module.css';

interface Props {
  covers?: string[];
  size?: number;
}

export default function TrioCoverBadge({ covers = [], size = 42 }: Props) {
  const validCovers = covers.filter((c) => Boolean(c && c.trim())).slice(0, 3);

  if (validCovers.length === 0) {
    return (
      <div
        className={styles.empty}
        style={{ width: `${size}px`, height: `${size}px` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={styles.container}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {validCovers.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={idx}
          src={src}
          alt=""
          className={styles.slice}
          loading="lazy"
        />
      ))}
    </div>
  );
}
