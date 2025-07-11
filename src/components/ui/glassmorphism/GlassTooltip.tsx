'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { combineGlassClasses } from './utils';

export interface GlassTooltipProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const GlassTooltip = forwardRef<HTMLDivElement, GlassTooltipProps>(
  ({ message, position = 'top', className = '', children, ...props }, ref) => {
    const tooltipClasses = combineGlassClasses(
      'cardDark',
      `absolute ${className} opacity-0 group-hover:opacity-100 transition-opacity duration-300`,
      'smooth'
    );

    const positionClasses = {
      top: '-translate-y-full translate-x-1/2 left-1/2 -bottom-1',
      bottom: 'translate-y-full translate-x-1/2 left-1/2 -top-1',
      left: '-translate-x-full translate-y-1/2 top-1/2 -right-1',
      right: 'translate-x-full translate-y-1/2 top-1/2 -left-1',
    };

    return (
      <div className="group relative" {...props} ref={ref}>
        {children}
        <div
          className={`pointer-events-none ${tooltipClasses} ${positionClasses[position]}`}
        >
          <div className="p-2 text-center text-xs text-white">{message}</div>
        </div>
      </div>
    );
  }
);

GlassTooltip.displayName = 'GlassTooltip';
