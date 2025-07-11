'use client';

import { SignUp } from '@clerk/nextjs';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  initFadeAnimations,
  initGlassmorphismEffects,
} from '@/lib/utils/animations/index';
import { gsapDevTools } from '@/utils/gsap-devtools';
import Image from 'next/image';

/**
 * Enhanced Glassmorphic Sign-Up Background following @foglogin inspiration
 * Uses different color scheme for sign-up vs sign-in differentiation
 */
const FogGlassmorphicBackground = () => {
  return (
    <>
      {/* Primary dark gradient base with cyan accent */}
      <div className="fixed inset-0 bg-gradient-to-b from-cyan-500/20 via-cyan-700/30 to-black" />

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Fog-like gradient orbs */}
      <div className="fixed top-0 left-1/2 h-[60vh] w-[120vh] -translate-x-1/2 transform rounded-b-[50%] bg-cyan-400/15 blur-[80px]" />
      <div
        className="fixed top-0 left-1/2 h-[60vh] w-[100vh] -translate-x-1/2 transform animate-pulse rounded-b-full bg-cyan-300/15 blur-[60px]"
        style={{ animationDuration: '8s' }}
      />

      {/* Floating particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-float absolute h-1 w-1 rounded-full bg-cyan-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};

/**
 * Glassmorphic container for Clerk SignUp component
 */
const GlassmorphicSignUpContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="group relative">
      {/* Animated border highlights with cyan theme */}
      <div className="absolute -inset-[1px] overflow-hidden rounded-2xl opacity-50">
        <div
          className="animate-border-chase absolute top-0 left-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="animate-border-chase-vertical absolute top-0 right-0 h-[40%] w-[2px] bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent"
          style={{ animationDelay: '0.75s' }}
        />
        <div
          className="animate-border-chase absolute right-0 bottom-0 h-[2px] w-[40%] bg-gradient-to-l from-transparent via-cyan-400/60 to-transparent"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="animate-border-chase-vertical absolute bottom-0 left-0 h-[40%] w-[2px] bg-gradient-to-t from-transparent via-cyan-400/60 to-transparent"
          style={{ animationDelay: '2.25s' }}
        />
      </div>

      {/* Main glassmorphic container */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/[0.08] bg-black/50 shadow-2xl backdrop-blur-xl">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(135deg, cyan 0.5px, transparent 0.5px), linear-gradient(45deg, cyan 0.5px, transparent 0.5px)`,
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default function Page() {
  // Initialize animations following GSAP rules
  useGSAP(() => {
    const timer = setTimeout(() => {
      gsapDevTools.monitorPerformance('Sign-Up Page Animations', () => {
        initFadeAnimations();
        initGlassmorphismEffects();
      });
    }, 100);

    return () => clearTimeout(timer);
  });

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden text-white">
      {/* Enhanced Glassmorphic Background */}
      <FogGlassmorphicBackground />

      {/* Logo */}
      <div className="fade_top absolute top-8 left-1/2 -translate-x-1/2 transform">
        <div className="rounded-xl border border-cyan-400/30 bg-black/20 p-4 backdrop-blur-xl">
          <Image
            src="/traxplaya.svg"
            alt="#TraxPlaya Logo"
            width={120}
            height={60}
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Enhanced Clerk SignUp Component */}
      <div
        className="fade_bottom relative z-20"
        style={{ perspective: '1500px' }}
      >
        <GlassmorphicSignUpContainer>
          <div className="p-6">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0 shadow-[0_0_20px_rgba(0,255,255,0.3)]',
                  card: 'bg-transparent shadow-none border-0',
                  headerTitle: 'text-white font-bold text-2xl',
                  headerSubtitle: 'text-white/60',
                  socialButtonsBlockButton:
                    'bg-white/10 border-white/20 text-white hover:bg-white/20',
                  formFieldInput:
                    'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20',
                  formFieldLabel: 'text-white/80',
                  dividerText: 'text-white/60',
                  dividerLine: 'bg-white/20',
                  footerActionText: 'text-white/60',
                  footerActionLink: 'text-cyan-400 hover:text-cyan-300',
                  identityPreviewText: 'text-white/80',
                  identityPreviewEditButton:
                    'text-cyan-400 hover:text-cyan-300',
                },
              }}
            />
          </div>
        </GlassmorphicSignUpContainer>
      </div>
    </div>
  );
}
