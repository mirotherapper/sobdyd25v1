'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { combineGlassClasses } from './utils';

export interface GlassNavProps extends HTMLAttributes<HTMLElement> {
  variant?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}

export const GlassNav = forwardRef<HTMLElement, GlassNavProps>(
  ({ variant = 'horizontal', className = '', children, ...props }, ref) => {
    const navClasses = combineGlassClasses(
      'cardDark',
      `${variant === 'horizontal' ? 'flex-row' : 'flex-col'} flex ${className}`,
      'smooth'
    );

    return (
      <nav ref={ref} className={navClasses} {...props}>
        {children}
      </nav>
    );
  }
);

GlassNav.displayName = 'GlassNav';
