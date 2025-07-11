'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import {
  combineGlassClasses,
  glassPresets,
  gridPatterns,
  noiseTexture,
} from './utils';

export interface GlassContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the container */
  variant?: 'light' | 'dark' | 'panel';
  /** Whether to show the grid pattern overlay */
  showGrid?: boolean;
  /** Whether to show noise texture overlay */
  showNoise?: boolean;
  /** Whether to add floating orbs for atmosphere */
  atmosphericEffects?: boolean;
  /** Custom glassmorphism preset */
  preset?: keyof typeof glassPresets;
  children: React.ReactNode;
}

/**
 * GlassContainer Component
 *
 * A large glassmorphism container for layout sections following design rules:
 * - Larger scale transparency and blur effects
 * - Atmospheric background elements
 * - Proper layering for visual hierarchy
 * - Accessibility-compliant readability
 */
export const GlassContainer = forwardRef<HTMLDivElement, GlassContainerProps>(
  (
    {
      variant = 'dark',
      showGrid = true,
      showNoise = false,
      atmosphericEffects = false,
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
          return 'panelLight';
        case 'panel':
          return 'panelDark';
        case 'dark':
        default:
          return 'cardDark';
      }
    };

    // Combine all classes
    const containerClasses = combineGlassClasses(
      getPreset(),
      className,
      'smooth'
    );

    return (
      <div
        ref={ref}
        className={`group relative overflow-hidden ${containerClasses}`}
        {...props}
      >
        {/* Noise texture overlay for film grain effect */}
        {showNoise && (
          <div
            className="pointer-events-none absolute inset-0"
            style={noiseTexture}
          />
        )}

        {/* Grid pattern overlay for cyberpunk texture */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30"
            style={gridPatterns.medium}
          />
        )}

        {/* Atmospheric floating orbs */}
        {atmosphericEffects && (
          <div className="pointer-events-none absolute inset-0">
            {/* Large background orbs */}
            <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />
            <div
              className="absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-pink-500/5 blur-3xl"
              style={{ animationDelay: '0.5s' }}
            />
          </div>
        )}

        {/* Subtle border highlights */}
        <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 transform bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" />

        {/* Content container with proper z-index */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassContainer.displayName = 'GlassContainer';
