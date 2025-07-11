'use client';

import React, { useRef, useEffect } from 'react';
import { SignIn } from '@clerk/nextjs';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';

/**
 * SPLASH LOGIN SCREEN - OPTION B
 *
 * DESIGN REASONING:
 * - Space: Full-screen immersive experience with layered depth
 * - Balance: Central login form with dynamic background that doesn't compete
 * - Aesthetic: Cyberpunk glassmorphism with animated grid and particles
 * - Flow: Visual impact → Focus → Action progression
 * - Color: Cyan/purple neon palette with proper contrast ratios
 */

interface ParticleSystemProps {
  count?: number;
  speed?: number;
}

/**
 * Animated Particle Grid System
 * Creates cyberpunk atmosphere with performance optimization
 */
const ParticleGridSystem: React.FC<ParticleSystemProps> = ({
  count = 50,
  speed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Create particles with GSAP optimization
    particlesRef.current.forEach((particle, index) => {
      if (!particle) return;

      // Staggered animation start for natural feel
      const delay = index * 0.1;

      // Floating animation with physics-like movement
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
      });

      // Infinite floating movement
      gsap.to(particle, {
        x: `+=${(Math.random() - 0.5) * 200}`,
        y: `+=${(Math.random() - 0.5) * 200}`,
        duration: 10 + Math.random() * 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay,
      });

      // Subtle pulsing glow
      gsap.to(particle, {
        opacity: 0.1,
        duration: 2 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay: delay + Math.random() * 2,
      });
    });

    return () => {
      // Cleanup GSAP animations
      gsap.killTweensOf(particlesRef.current);
    };
  }, [count, speed]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          ref={el => {
            if (el) {
              particlesRef.current[i] = el;
            }
          }}
          className="absolute h-[2px] w-[2px] rounded-full bg-cyan-400/60"
          style={{
            filter: 'blur(0.5px)',
            boxShadow: '0 0 4px rgba(0, 255, 255, 0.8)',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Cyberpunk Grid Background
 * Creates depth with animated grid lines and neon glow
 */
const CyberpunkGridBackground: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!gridRef.current) return;

    // Animated grid movement for depth
    gsap.to(gridRef.current, {
      backgroundPosition: '100px 100px',
      duration: 20,
      repeat: -1,
      ease: 'none',
    });
  }, []);

  return (
    <>
      {/* Primary gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black" />

      {/* Animated cyberpunk grid */}
      <div
        ref={gridRef}
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(255, 0, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 50px 50px, 100px 100px, 100px 100px',
        }}
      />

      {/* Radial glow effects for depth */}
      <div className="fixed top-1/4 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="fixed right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Horizon line effect */}
      <div
        className="fixed right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
        style={{
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
        }}
      />
    </>
  );
};

/**
 * Enhanced Logo Display
 * Glassmorphism container with animated elements
 */
const LogoDisplay: React.FC = () => {
  const logoRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!logoRef.current) return;

    // Entrance animation
    gsap.fromTo(
      logoRef.current,
      {
        opacity: 0,
        y: -50,
        scale: 0.8,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'back.out(1.7)',
        delay: 0.5,
      }
    );

    // Subtle floating animation
    gsap.to(logoRef.current, {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <div
      ref={logoRef}
      className="absolute top-8 left-1/2 z-[30] -translate-x-1/2 transform"
    >
      <div className="group relative">
        {/* Glow effect behind logo */}
        <div className="absolute inset-0 scale-110 rounded-xl bg-cyan-400/20 blur-xl transition-all duration-500 group-hover:bg-cyan-400/30" />

        {/* Glassmorphism container */}
        <div className="relative rounded-xl border border-cyan-400/30 bg-black/30 p-6 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10" />
          <Image
            src="/traxplaya.svg"
            alt="#TraxPlaya Logo"
            width={140}
            height={70}
            className="relative z-10 h-14 w-auto"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Login Container
 * Advanced glassmorphism with animated borders and effects
 */
const LoginContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Entrance animation with perspective
    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        scale: 0.9,
        rotationX: 15,
        y: 50,
      },
      {
        opacity: 1,
        scale: 1,
        rotationX: 0,
        y: 0,
        duration: 1.5,
        ease: 'power3.out',
        delay: 1,
      }
    );

    // Animated border glow
    if (borderRef.current) {
      gsap.to(borderRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none',
      });
    }
  }, []);

  return (
    <div className="relative z-[20]" style={{ perspective: '1500px' }}>
      <div ref={containerRef} className="group relative">
        {/* Rotating border glow */}
        <div
          ref={borderRef}
          className="absolute -inset-[2px] rounded-2xl opacity-50"
          style={{
            background: `conic-gradient(from 0deg, 
              transparent, 
              rgba(0, 255, 255, 0.4), 
              transparent, 
              rgba(255, 0, 255, 0.4), 
              transparent
            )`,
          }}
        />

        {/* Main glassmorphism container */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl">
          {/* Subtle animated grid texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(135deg, white 1px, transparent 1px), 
                linear-gradient(45deg, white 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              animation: 'gridShift 30s linear infinite',
            }}
          />

          {/* Top highlight line */}
          <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          {/* Content container */}
          <div className="relative z-10 p-8">
            <div className="space-y-6 text-center">
              <h1 className="mb-4 text-3xl font-bold text-white">
                Welcome to #TraxPlaya
              </h1>
              <p className="mb-8 text-lg text-cyan-200/80">
                Admin Dashboard - Music Streaming Platform
              </p>

              <div className="space-y-4">
                <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                <button className="w-full rounded-lg border-0 bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-3 font-semibold text-white shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300 hover:from-cyan-400 hover:to-purple-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.6)]">
                  Sign In
                </button>
              </div>

              <div className="mt-6 border-t border-white/20 pt-6">
                <p className="text-sm text-white/70">
                  Don't have an account?{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300">
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom glow accent */}
          <div className="absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 transform bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
        </div>

        {/* Ambient glow effect */}
        <div className="absolute inset-0 -z-10 scale-105 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 blur-xl transition-transform duration-700 group-hover:scale-110" />
      </div>
    </div>
  );
};

/**
 * Main Splash Login Component
 * Orchestrates all elements with proper timing and animations
 */
export const SplashLogin: React.FC = () => {
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
      {/* Background layers */}
      <CyberpunkGridBackground />
      <ParticleGridSystem count={40} speed={1} />
      {/* Logo */}
      <LogoDisplay />
      {/* Main login form with real content */}
      div className="relative z-10 p-8" div className="text-center space-y-6" h1
      className="text-3xl font-bold text-white mb-4"Welcome to StayOnBeat/h1 p
      className="text-cyan-200/80 text-lg mb-8"Admin Dashboard - Music Streaming
      Platform/p div className="space-y-4" div className="bg-white/10 border
      border-white/20 text-white rounded-lg px-4 py-3 backdrop-blur-sm" input
      type="email" placeholder="Email" className="w-full bg-transparent
      outline-none" / /div div className="bg-white/10 border border-white/20
      text-white rounded-lg px-4 py-3 backdrop-blur-sm" input type="password"
      placeholder="Password" className="w-full bg-transparent outline-none" /
      /div button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500
      hover:from-cyan-400 hover:to-purple-400 text-white border-0 rounded-lg
      px-8 py-3 shadow-[0_0_20px_rgba(0,255,255,0.4)]
      hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300
      font-semibold" Sign In /button /div /div /div
    </div>
  );
};

export default SplashLogin;
