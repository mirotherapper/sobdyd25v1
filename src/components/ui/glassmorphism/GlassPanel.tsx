'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { combineGlassClasses } from './utils';

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  children: React.ReactNode;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ variant = 'dark', className = '', children, ...props }, ref) => {
    const panelClasses = combineGlassClasses(
      variant === 'light' ? 'panelLight' : 'panelDark',
      className,
      'smooth'
    );

    return (
      <div ref={ref} className={panelClasses} {...props}>
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';
