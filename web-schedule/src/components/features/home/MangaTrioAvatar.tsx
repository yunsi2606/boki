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
    return (
      <div
        className={styles.emptyAvatar}
        style={{ width: `${size}px`, height: `${size}px` }}
        aria-hidden="true"
      />
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
