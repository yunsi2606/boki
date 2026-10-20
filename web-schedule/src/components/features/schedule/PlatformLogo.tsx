'use client';

import React, { useState } from 'react';

interface Props {
  platform: string;
  size?: number;
  className?: string;
}

export function PlatformLogo({ platform, size = 20, className }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const normalized = (platform || '').toUpperCase();

  const getPlatformKey = () => {
    if (normalized.includes('SHOPEE')) return 'shopee';
    if (normalized.includes('TIKTOK')) return 'tiktok';
    if (normalized.includes('TIKI')) return 'tiki';
    if (normalized.includes('FAHASA')) return 'fahasa';
    if (normalized.includes('BOKI')) return 'boki';
    return 'other';
  };

  const key = getPlatformKey();
  const imgSrc = `/logos/platforms/${key}.png`;

  if (!imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt={platform}
        width={size}
        height={size}
        className={className}
        onError={() => setImgFailed(true)}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: 4,
          flexShrink: 0,
        }}
      />
    );
  }

  // Built-in high-quality vector SVG fallbacks
  switch (key) {
    case 'shopee':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ flexShrink: 0 }}
        >
          <rect width="24" height="24" rx="5" fill="#EE4D2D" />
          <path
            d="M8.5 8V6.5C8.5 4.567 10.067 3 12 3C13.933 3 15.5 4.567 15.5 6.5V8H18C18.5523 8 19 8.44772 19 9V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V9C5 8.44772 5.44772 8 6 8H8.5ZM10 8H14V6.5C14 5.39543 13.1046 4.5 12 4.5C10.8954 4.5 10 5.39543 10 6.5V8ZM12.2 11C10.8 11 9.8 11.7 9.8 12.8C9.8 14.5 14.2 13.8 14.2 15.8C14.2 16.5 13.5 17 12.1 17C10.9 17 10.1 16.5 9.8 15.9L8.5 16.7C9.1 17.7 10.4 18.5 12.1 18.5C14.2 18.5 15.6 17.4 15.6 15.8C15.6 13.9 11.2 14.7 11.2 12.8C11.2 12.3 11.7 11.8 12.3 11.8C13.2 11.8 13.9 12.2 14.2 12.6L15.3 11.7C14.6 11.2 13.6 11 12.2 11Z"
            fill="white"
          />
        </svg>
      );
    case 'tiktok':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ flexShrink: 0 }}
        >
          <rect width="24" height="24" rx="5" fill="#010101" />
          <path
            d="M15.5 4C15.8 5.7 17.2 7 19 7.2V10C17.6 10 16.3 9.4 15.5 8.5V14.8C15.5 17.7 13.2 20 10.3 20C7.4 20 5 17.7 5 14.8C5 12 7.3 9.6 10.2 9.6C10.6 9.6 11 9.7 11.4 9.8V12.7C11 12.5 10.7 12.4 10.3 12.4C9 12.4 7.9 13.5 7.9 14.8C7.9 16.1 9 17.2 10.3 17.2C11.6 17.2 12.7 16.1 12.7 14.8V4H15.5Z"
            fill="#25F4EE"
          />
          <path
            d="M16 4.5C16.3 6.2 17.7 7.5 19.5 7.7V9.5C18.1 9.5 16.8 8.9 16 8V14.3C16 17.2 13.7 19.5 10.8 19.5C8 19.5 5.7 17.2 5.7 14.3C5.7 11.6 7.9 9.3 10.7 9.3C11.1 9.3 11.5 9.4 11.9 9.5V12.2C11.6 12.1 11.2 12 10.8 12C9.5 12 8.5 13 8.5 14.3C8.5 15.6 9.5 16.6 10.8 16.6C12.1 16.6 13.2 15.6 13.2 14.3V4.5H16Z"
            fill="#FE2C55"
            style={{ mixBlendMode: 'screen' }}
          />
        </svg>
      );
    case 'tiki':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ flexShrink: 0 }}
        >
          <rect width="24" height="24" rx="5" fill="#1A94FF" />
          <path
            d="M5 8.5H9.5V10.5H8V17H6.5V10.5H5V8.5ZM11 8.5H12.5V17H11V8.5ZM14 8.5H15.5V12.2L17.8 8.5H19.6L16.8 12.8L19.7 17H17.8L15.5 13.4V17H14V8.5Z"
            fill="white"
          />
        </svg>
      );
    case 'fahasa':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ flexShrink: 0 }}
        >
          <rect width="24" height="24" rx="5" fill="#C92127" />
          <path
            d="M6 7H18V9H8.5V11.5H16V13.5H8.5V17H6V7ZM12 15H18V17H12V15Z"
            fill="white"
          />
        </svg>
      );
    case 'boki':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ flexShrink: 0 }}
        >
          <rect width="24" height="24" rx="5" fill="#EE4D2D" />
          <path
            d="M7 6C7 5.44772 7.44772 5 8 5H16C16.5523 5 17 5.44772 17 6V18C17 18.5523 16.5523 19 16 19H8C7.44772 19 7 18.5523 7 18V6Z"
            stroke="white"
            strokeWidth="1.6"
          />
          <path d="M10 9H14M10 12H14M10 15H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ flexShrink: 0 }}
        >
          <rect width="24" height="24" rx="5" fill="#4B5563" />
          <path
            d="M6 8L7.5 4H16.5L18 8M6 8V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V8M6 8H18"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
