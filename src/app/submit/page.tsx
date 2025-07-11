/* ENHANCED GLASSMORPHIC DESIGN FOLLOWING #@01 DESIGN RULES */
'use client';

import { QueUpForm } from '@/components/playlist-system/submission/Que-Up-Form';
import { SignIn, useAuth } from '@clerk/nextjs';
import { PromotionalBanner } from '@/components/playlist-system/submission/promotional-banner';
import Image from 'next/image';
import { Suspense } from 'react';
import { gsap } from 'gsap';
import useScrollSmooth from '@/lib/hooks/useScrollSmooth';
import { ScrollTrigger, useGSAP } from '@/lib/gsap/plugins';
import {
  initFadeAnimations,
  initTextAnimations,
  initCardMouseParallax,
  initGlassmorphismEffects,
} from '@/lib/utils/animations/index';
import { Upload, Zap, Music } from 'lucide-react';
import { gsapDevTools } from '@/utils/gsap-devtools';

// Register all plugins globally
gsap.registerPlugin(ScrollTrigger);

/**
 * Enhanced Glassmorphic Background following Design Rules:
 * - Transparency and background blur properly balanced
 * - Subtle layering for depth without overwhelming
 * - Maintains readability and accessibility
 * - Uses proper color contrast for WCAG compliance
 */
const EnhancedGlassmorphicBackground = () => {
  return (
    <>
      {/* Primary background gradient - Dark base */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* Cyberpunk grid overlay - Subtle and not distracting */}
      <div className="fixed inset-0 opacity-30">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Animated background elements - Positioned for visual hierarchy */}
      <div className="pointer-events-none fixed inset-0">
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
    </>
  );
};

/**
 * Glassmorphic Card Container following Design Rules:
 * - Proper backdrop-blur with balanced transparency
 * - Subtle borders and highlights for definition
 * - Maintains content legibility
 * - Enhanced on hover without being distracting
 */
const GlassmorphicContainer = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-black/40 shadow-[0_0_30px_rgba(0,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-500 ease-out hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(0,255,255,0.2)] ${className} `}
    >
      {/* Cyberpunk grid overlay - Subtle visual texture */}
      <div className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Subtle glow effect on hover - Enhances depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      {/* Content container with proper z-index */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default function SubmitPage() {
  // Initialize smooth scrolling following GSAP rules
  useScrollSmooth();

  // Initialize animations with proper cleanup and monitoring
  useGSAP(() => {
    const timer = setTimeout(() => {
      // Use GSAP DevTools for monitoring performance
      gsapDevTools.monitorPerformance('Submit Page Animations', () => {
        initFadeAnimations();
        initTextAnimations();
        initCardMouseParallax();
        initGlassmorphismEffects();
      });

      // Refresh ScrollTrigger for proper functioning
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  });

  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null; // If auth is not loaded, return null

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SignIn routing="path" path="/sign-in" />
      </div>
    );
  }

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <div className="relative min-h-screen overflow-hidden text-white">
          {/* Enhanced Glassmorphic Background */}
          <EnhancedGlassmorphicBackground />

          {/* Header Section with proper visual hierarchy */}
          <section className="relative flex min-h-screen items-center justify-center px-4">
            <div className="mx-auto max-w-4xl space-y-8 text-center">
              {/* Logo in glassmorphic container */}
              <div className="fade_top mb-8 flex justify-center">
                <GlassmorphicContainer className="w-fit p-4">
                  <Image
                    src="/stayonbeat.svg"
                    alt="StayOnBeat Logo"
                    width={120}
                    height={60}
                    className="h-12 w-auto"
                  />
                </GlassmorphicContainer>
              </div>

              {/* Main Title with GSAP text-split animation */}
              <h1 className="text-split mb-8 text-center text-4xl font-bold md:text-6xl">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SUBMIT YOUR MUSIC
                </span>
              </h1>

              {/* Subtitle with proper contrast */}
              <p className="fade_bottom mx-auto max-w-2xl text-xl leading-relaxed text-gray-300 md:text-2xl">
                Join the future of music discovery. Get your trax reviewed by
                industry professionals and featured on premium playlists.
              </p>

              {/* Call to action with clear visual indicators */}
              <div className="fade_bottom flex items-center justify-center gap-4 text-cyan-400">
                <Music className="h-6 w-6" />
                <span className="text-lg font-medium">
                  Choose your submission Que-Up below
                </span>
                <Zap className="h-6 w-6" />
              </div>
            </div>
          </section>

          {/* Main Content Section */}
          <section className="relative px-4 py-20">
            <div className="container mx-auto">
              <div className="mx-auto max-w-[615px]">
                {/* Que-Up Selection in Enhanced Glassmorphic Container */}
                <div className="fade_bottom">
                  <GlassmorphicContainer>
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center py-12">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400"></div>
                          <span className="ml-3 font-medium text-cyan-400">
                            Loading submission Que-Ups...
                          </span>
                        </div>
                      }
                    >
                      <QueUpForm />
                    </Suspense>
                  </GlassmorphicContainer>
                </div>

                {/* Promotional Banner with proper spacing */}
                <div className="fade_bottom mt-8">
                  <PromotionalBanner />
                </div>
              </div>
            </div>
          </section>

          {/* Subtle floating particles - Limited for accessibility */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-float absolute h-1 w-1 rounded-full bg-cyan-400/20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
