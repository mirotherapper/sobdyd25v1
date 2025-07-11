'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import {
  combineGlassClasses,
  glassPresets,
  glassAnimations,
  gridPatterns,
} from './utils';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the glass card */
  variant?: 'light' | 'dark' | 'accent';
  /** Size preset for the card */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the grid pattern overlay */
  showGrid?: boolean;
  /** Animation preset to apply */
  animation?: keyof typeof glassAnimations.gsapClasses;
  /** Whether the card is interactive (hover effects) */
  interactive?: boolean;
  /** Whether to show subtle glow effect */
  glow?: boolean;
  /** Custom glassmorphism preset */
  preset?: keyof typeof glassPresets;
  children: React.ReactNode;
}

/**
 * GlassCard Component
 *
 * A reusable glassmorphism card component following design rules:
 * - Proper transparency and background blur
 * - Accessibility-compliant contrast ratios
 * - Multi-layered approach for depth
 * - Subtle borders and highlights
 * - Performance-optimized animations
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'dark',
      size = 'medium',
      showGrid = true,
      animation = 'fadeIn',
      interactive = false,
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
        case 'light':
          return 'cardLight';
        case 'accent':
          return interactive ? 'button' : 'cardDark';
        case 'dark':
        default:
          return 'cardDark';
      }
    };

    // Size-based padding classes
    const sizeClasses = {
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8',
    };

    // Interactive hover effects
    const interactiveClasses = interactive
      ? 'hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group'
      : '';

    // Glow effect classes
    const glowClasses = glow
      ? 'hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-shadow duration-500'
      : '';

    // Animation classes
    const animationClasses = glassAnimations.gsapClasses[animation];

    // Combine all classes
    const cardClasses = combineGlassClasses(
      getPreset(),
      `${sizeClasses[size]} ${interactiveClasses} ${glowClasses} ${animationClasses} ${className}`,
      'smooth'
    );

    return (
      <div
        ref={ref}
        className={`group relative overflow-hidden ${cardClasses}`}
        {...props}
      >
        {/* Grid pattern overlay for texture */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30"
            style={gridPatterns.subtle}
          />
        )}

        {/* Subtle glow effect on hover */}
        {glow && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        )}

        {/* Top highlight line */}
        <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        {/* Content container with proper z-index */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
