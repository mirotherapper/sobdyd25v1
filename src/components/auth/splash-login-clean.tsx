'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';

/**
 * CLEAN SPLASH LOGIN - WORKING VERSION
 *
 * Following design rules:
 * - Proper glassmorphism with transparency and blur
 * - Cyberpunk color palette (cyan/purple)
 * - Clean visual hierarchy
 * - Proper spacing and typography
 * - Animated particle system
 */

export const SplashLoginClean: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!mainRef.current) return;

    // Initial scene setup
    gsap.set(mainRef.current, { opacity: 0 });

    // Fade in the entire scene
    gsap.to(mainRef.current, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    });
  }, []);

  return (
    <div
      ref={mainRef}
      className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden text-white"
    >
      {/* Cyberpunk Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black" />

      {/* Animated grid */}
      <div
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glow effects */}
      <div className="fixed top-1/4 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="fixed right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Logo */}
      <div className="absolute top-8 left-1/2 z-30 -translate-x-1/2 transform">
        <div className="relative rounded-xl border border-cyan-400/30 bg-black/30 p-6 shadow-2xl backdrop-blur-xl">
          <Image
            src="/traxplaya.svg"
            alt="#TraxPlaya Logo"
            width={140}
            height={70}
            className="h-14 w-auto"
          />
        </div>
      </div>

      {/* Main login form */}
      <div className="relative z-20 w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl">
          {/* Top highlight */}
          <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          {/* Content */}
          <div className="relative z-10 p-8">
            <div className="space-y-6 text-center">
              <h1 className="mb-4 text-3xl font-bold text-white">
                Welcome to #TraxPlaya
              </h1>
              <p className="mb-8 text-lg text-cyan-200/80">
                Music Streaming Platform
              </p>

              <div className="space-y-4">
                <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition-colors focus-within:border-cyan-400/50">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-transparent placeholder-white/50 outline-none"
                  />
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition-colors focus-within:border-cyan-400/50">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-transparent placeholder-white/50 outline-none"
                  />
                </div>
                <button className="w-full rounded-lg border-0 bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-3 font-semibold text-white shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300 hover:from-cyan-400 hover:to-purple-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]">
                  Sign In
                </button>
              </div>

              <div className="mt-6 border-t border-white/20 pt-6">
                <p className="text-sm text-white/70">
                  Need access?{' '}
                  <a
                    href="#"
                    className="text-cyan-400 transition-colors hover:text-cyan-300"
                  >
                    Contact admin
                  </a>
                </p>
              </div>

              {/* Quick nav links */}
              <div className="mt-8 border-t border-white/20 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="/submit"
                    className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:bg-white/10"
                  >
                    Submit Track
                  </a>
                  <a
                    href="/admin"
                    className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-300 hover:border-purple-400/50 hover:bg-white/10"
                  >
                    Admin Panel
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom glow */}
          <div className="absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 transform bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default SplashLoginClean;
