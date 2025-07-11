'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { combineGlassClasses, glassPresets } from './utils';

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'accent';
  preset?: keyof typeof glassPresets;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ variant = 'default', preset, className = '', ...props }, ref) => {
    const getPreset = (): keyof typeof glassPresets => {
      if (preset) return preset;
      return 'input';
    };

    const inputClasses = combineGlassClasses(
      getPreset(),
      `w-full text-white placeholder-white/50 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none ${className}`,
      'medium'
    );

    return <input ref={ref} className={inputClasses} {...props} />;
  }
);

GlassInput.displayName = 'GlassInput';
