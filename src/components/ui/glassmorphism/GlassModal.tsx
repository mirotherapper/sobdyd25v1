'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { combineGlassClasses } from './utils';

export interface GlassModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const GlassModal = forwardRef<HTMLDivElement, GlassModalProps>(
  ({ isOpen, onClose, className = '', children, ...props }, ref) => {
    if (!isOpen) return null;

    const modalClasses = combineGlassClasses(
      'panelDark',
      `fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`,
      'smooth'
    );

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div ref={ref} className={modalClasses} {...props}>
          <div className="relative z-10 w-full max-w-md">{children}</div>
        </div>
      </div>
    );
  }
);

GlassModal.displayName = 'GlassModal';
