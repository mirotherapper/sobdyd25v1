'use client';

import React from 'react';
import { SplashLogin } from '@/components/auth/splashlogin';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import useScrollSmooth from '@/lib/hooks/useScrollSmooth';

/**
 * SPLASH LOGIN PAGE - OPTION B
 *
 * Alternative login experience with enhanced cyberpunk aesthetics
 * Features particle systems, animated grids, and glassmorphism design
 *
 * DESIGN REASONING:
 * - Provides immersive alternative to standard Clerk login
 * - Uses established design system with enhanced visual effects
 * - Maintains accessibility while creating engaging experience
 * - Optimized GSAP animations with proper cleanup
 */

export default function SplashLoginPage() {
  // Initialize smooth scrolling (disabled for login page)
  // useScrollSmooth();

  // Page-level animations and setup
  useGSAP(() => {
    // Register GSAP plugins
    gsap.registerPlugin();

    // Preload critical animations
    gsap.set('body', { overflow: 'hidden' });

    return () => {
      // Cleanup on unmount
      gsap.set('body', { overflow: 'auto' });
    };
  }, []);

  return (
    <>
      {/* Meta tags for this specific page */}
      <title>StayOnBeat - Splash Login</title>
      <meta
        name="description"
        content="Sign in to StayOnBeat - Enhanced login experience"
      />

      {/* Main splash login component */}
      <SplashLogin />
    </>
  );
}

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';
