'use client';

import React from 'react';
import styles from './mangaTrioAvatar.module.css';

interface Props {
  covers?: string[];
  size?: number;
  title?: string;
}

export function MangaTrioAvatar({ covers = [], size = 48, title = '' }: Props) {
  const validCovers = covers.filter((c) => Boolean(c && c.trim())).slice(0, 3);

  if (validCovers.length === 0) {
    const iconSize = Math.round(size * 0.45);
    return (
      <div
        className={styles.emptyAvatar}
        style={{ width: `${size}px`, height: `${size}px` }}
        aria-hidden="true"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary-500, #ee4d2d)"
          strokeWidth="2.2"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={styles.trioContainer}
      style={{ width: `${size}px`, height: `${size}px` }}
      title={title}
    >
      {validCovers.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={src}
          alt=""
          className={styles.trioSlice}
          loading="lazy"
        />
      ))}
    </div>
  );
}
