// GlassButton.tsx
'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { combineGlassClasses, glassAnimations, glassPresets } from './utils';

export interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  animation?: keyof typeof glassAnimations.gsapClasses;
  glow?: boolean;
  preset?: keyof typeof glassPresets;
}

/**
 * GlassButton Component
 *
 * A button styled with glassmorphism design rules:
 * - Dynamic transparency and glowing effects
 * - Performance-optimized animations
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = 'primary',
      animation = 'fadeIn',
      glow = false,
      preset,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Determine the glassmorphism preset based on variant
    const getPreset = (): keyof typeof glassPresets => {
      if (preset) return preset;

      switch (variant) {
        case 'primary':
          return 'button';
        case 'secondary':
          return 'input';
        case 'accent':
        default:
          return 'button';
      }
    };

    // Glow effect classes
    const glowClasses = glow
      ? 'hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]'
      : '';

    // Animation classes
    const animationClasses = glassAnimations.gsapClasses[animation];

    // Combine all classes
    const buttonClasses = combineGlassClasses(
      getPreset(),
      `${glowClasses} ${animationClasses} ${className}`,
      'smooth'
    );

    return (
      <button ref={ref} className={buttonClasses} {...props}>
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
