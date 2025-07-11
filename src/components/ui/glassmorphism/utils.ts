// Glassmorphism Design Utilities
// Following design rules for proper transparency, blur, and accessibility

/**
 * Glassmorphism Design Tokens
 * Based on design rules for proper transparency and blur balance
 */
export const glassTokens = {
  // Background transparency levels
  transparency: {
    light: 'bg-white/10',
    medium: 'bg-white/20',
    heavy: 'bg-white/30',
    dark: 'bg-black/20',
    darkMedium: 'bg-black/40',
    darkHeavy: 'bg-black/60',
  },

  // Backdrop blur levels
  blur: {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    heavy: 'backdrop-blur-xl',
    ultra: 'backdrop-blur-2xl',
  },

  // Border definitions for edge highlighting
  borders: {
    light: 'border border-white/10',
    medium: 'border border-white/20',
    heavy: 'border border-white/30',
    accent: 'border border-cyan-400/30',
    accentActive: 'border border-cyan-400/50',
  },

  // Shadow definitions for depth
  shadows: {
    light: 'shadow-[0_0_15px_rgba(0,255,255,0.1)]',
    medium: 'shadow-[0_0_25px_rgba(0,255,255,0.2)]',
    heavy: 'shadow-[0_0_35px_rgba(0,255,255,0.3)]',
    inset: 'shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
    combined:
      'shadow-[0_0_25px_rgba(0,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
  },

  // Rounded corner definitions
  radius: {
    small: 'rounded-lg',
    medium: 'rounded-xl',
    large: 'rounded-2xl',
    full: 'rounded-full',
  },
};

/**
 * Glassmorphism Preset Combinations
 * Pre-configured combinations following design rules
 */
export const glassPresets = {
  // Light theme presets
  cardLight: `${glassTokens.transparency.light} ${glassTokens.blur.medium} ${glassTokens.borders.light} ${glassTokens.shadows.light} ${glassTokens.radius.medium}`,
  panelLight: `${glassTokens.transparency.medium} ${glassTokens.blur.heavy} ${glassTokens.borders.medium} ${glassTokens.shadows.medium} ${glassTokens.radius.large}`,

  // Dark theme presets (recommended for DoYouDj)
  cardDark: `${glassTokens.transparency.darkMedium} ${glassTokens.blur.heavy} ${glassTokens.borders.accent} ${glassTokens.shadows.combined} ${glassTokens.radius.medium}`,
  panelDark: `${glassTokens.transparency.darkHeavy} ${glassTokens.blur.ultra} ${glassTokens.borders.accentActive} ${glassTokens.shadows.heavy} ${glassTokens.radius.large}`,

  // Interactive elements
  button: `${glassTokens.transparency.darkMedium} ${glassTokens.blur.medium} ${glassTokens.borders.accent} ${glassTokens.shadows.medium} ${glassTokens.radius.small}`,
  input: `${glassTokens.transparency.dark} ${glassTokens.blur.light} ${glassTokens.borders.light} ${glassTokens.radius.small}`,

  // Special states
  hover: `hover:${glassTokens.transparency.darkHeavy} hover:${glassTokens.borders.accentActive} hover:${glassTokens.shadows.heavy}`,
  focus: `focus:${glassTokens.borders.accentActive} focus:ring-2 focus:ring-cyan-400/20`,
  active: `${glassTokens.transparency.darkHeavy} ${glassTokens.borders.accentActive} ${glassTokens.shadows.heavy}`,
};

/**
 * Accessibility-compliant color combinations
 * Ensuring WCAG compliance for glassmorphism elements
 */
export const accessibleColors = {
  // Text colors with proper contrast
  text: {
    primary: 'text-white',
    secondary: 'text-white/80',
    muted: 'text-white/60',
    accent: 'text-cyan-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  },

  // Background overlays for better readability
  overlays: {
    darkLight: 'bg-black/20',
    darkMedium: 'bg-black/40',
    darkHeavy: 'bg-black/60',
    coloredLight:
      'bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10',
    coloredMedium:
      'bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20',
  },
};

/**
 * Animation utilities for glassmorphism effects
 * Following GSAP animation patterns
 */
export const glassAnimations = {
  // Transition classes
  transitions: {
    fast: 'transition-all duration-200 ease-out',
    medium: 'transition-all duration-300 ease-out',
    slow: 'transition-all duration-500 ease-out',
    smooth:
      'transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
  },

  // Transform effects
  transforms: {
    subtle: 'hover:scale-[1.02] hover:-translate-y-1',
    medium: 'hover:scale-105 hover:-translate-y-2',
    dramatic: 'hover:scale-110 hover:-translate-y-3',
  },

  // GSAP animation classes
  gsapClasses: {
    fadeIn: 'glass-card',
    slideUp: 'fade_bottom',
    slideDown: 'fade_top',
    slideLeft: 'fade_left',
    slideRight: 'fade_right',
    textReveal: 'text-split',
    hoverEffect: 'hover-card',
  },
};

/**
 * Utility function to combine glassmorphism classes
 * @param preset - Preset combination
 * @param additional - Additional classes
 * @param transitions - Transition effects
 * @returns Combined class string
 */
export const combineGlassClasses = (
  preset: keyof typeof glassPresets,
  additional: string = '',
  transitions: keyof typeof glassAnimations.transitions = 'medium'
): string => {
  return [
    glassPresets[preset],
    glassAnimations.transitions[transitions],
    additional,
  ]
    .filter(Boolean)
    .join(' ');
};

/**
 * Utility function to create responsive glassmorphism
 * @param mobile - Mobile classes
 * @param desktop - Desktop classes
 * @returns Responsive class string
 */
export const responsiveGlass = (mobile: string, desktop: string): string => {
  return `${mobile} md:${desktop}`;
};

/**
 * Utility function for conditional glassmorphism states
 * @param base - Base classes
 * @param condition - Condition to apply state
 * @param state - State classes
 * @returns Conditional class string
 */
export const conditionalGlass = (
  base: string,
  condition: boolean,
  state: string
): string => {
  return condition ? `${base} ${state}` : base;
};

/**
 * Grid pattern utility for glassmorphism backgrounds
 * Following cyberpunk aesthetic rules
 */
export const gridPatterns = {
  subtle: {
    backgroundImage: `
      linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
  },
  medium: {
    backgroundImage: `
      linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: '30px 30px',
  },
  prominent: {
    backgroundImage: `
      linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
  },
};

/**
 * Noise texture utility for film grain effect
 * Following glassmorphism layering rules
 */
export const noiseTexture = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  backgroundSize: '200px 200px',
  opacity: 0.02,
  mixBlendMode: 'soft-light' as const,
};
