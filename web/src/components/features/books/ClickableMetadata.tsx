'use client';

import React from 'react';
import Link from 'next/link';
import { splitEntityValues } from '@/utils/entityMatch';

interface ClickableMetadataProps {
  value?: string | null;
  paramName: string;
  className?: string;
  linkClassName?: string;
  stopPropagation?: boolean;
}

export default function ClickableMetadata({
  value,
  paramName,
  className,
  linkClassName,
  stopPropagation = false,
}: ClickableMetadataProps) {
  if (!value) return null;

  const items = splitEntityValues(value);
  if (items.length === 0) return null;

  return (
    <span className={className}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const href = `/books?${encodeURIComponent(paramName)}=${encodeURIComponent(item)}`;

        return (
          <span key={`${item}-${index}`}>
            <Link
              href={href}
              className={linkClassName}
              onClick={(e) => {
                if (stopPropagation) {
                  e.stopPropagation();
                }
              }}
            >
              {item}
            </Link>
            {!isLast && <span>, </span>}
          </span>
        );
      })}
    </span>
  );
}
