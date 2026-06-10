import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  padded?: boolean;
  glass?: boolean;
}

export default function Card({
  children,
  hoverable = false,
  padded = true,
  glass = false,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    styles.card,
    hoverable ? styles.hoverable : '',
    padded ? styles.padded : '',
    glass ? styles.glass : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
