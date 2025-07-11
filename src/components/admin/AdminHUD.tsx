'use client';

import React, { useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * The type of animation to apply to the main icon on the tab.
 * - `pulse`: The icon will gently scale up and down.
 * - `rotate`: The icon will rotate 360 degrees and pulse.
 * - `none`: No continuous animation on the icon.
 */
type IconAnimation = 'pulse' | 'rotate' | 'none';

interface AdminHUDProps {
  /** Controls whether the panel is open or closed. */
  isOpen: boolean;
  /** Callback function to toggle the `isOpen` state. */
  onToggle: () => void;
  /** Determines which side of the screen the HUD is attached to. */
  side: 'left' | 'right';
  /** The vertical text label displayed on the tab. */
  label: string;
  /** The icon element to display on the tab. */
  icon: ReactNode;
  /** The content to be displayed inside the slide-out panel. */
  children: ReactNode;
  /** The type of animation for the icon on the tab. Defaults to `pulse`. */
  iconAnimation?: IconAnimation;
}

export function AdminHUD({
  isOpen,
  onToggle,
  side,
  label,
  icon,
  children,
  iconAnimation = 'pulse',
}: AdminHUDProps) {
  const tabRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const ledRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  const isLeft = side === 'left';

  // Continuous animations for the tab's visual effects
  useGSAP(
    () => {
      gsap.to(scanLineRef.current, {
        y: 120,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      });
      gsap.to(ledRef.current, {
        opacity: 1,
        scale: 1.2,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });

      if (iconRef.current) {
        if (iconAnimation === 'rotate') {
          gsap.to(iconRef.current, {
            rotation: 360,
            duration: 4,
            repeat: -1,
            ease: 'none',
          });
        }
        if (iconAnimation === 'rotate' || iconAnimation === 'pulse') {
          gsap.to(iconRef.current, {
            scale: 1.1,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut',
          });
        }
      }
    },
    { scope: tabRef, dependencies: [iconAnimation] }
  );

  // Animations that depend on the open/closed state
  useGSAP(
    () => {
      const panelWidth = 320;
      gsap.to(panelRef.current, {
        x: isOpen ? 0 : isLeft ? -panelWidth : panelWidth,
        duration: 0.6,
        ease: 'power3.inOut',
      });
      gsap.to(chevronRef.current, {
        x: isOpen ? (isLeft ? -5 : 5) : 0,
        rotation: isOpen ? 180 : 0,
        duration: 0.3,
        ease: 'power2.inOut',
      });
    },
    { dependencies: [isOpen, isLeft] }
  );

  // GSAP-based interaction handlers
  const handleHover = () =>
    gsap.to(tabRef.current, { scale: 1.05, duration: 0.2 });
  const handleHoverOut = () =>
    gsap.to(tabRef.current, { scale: 1, duration: 0.2 });
  const handleClick = () => {
    gsap.to(tabRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });
    onToggle();
  };

  // Dynamically set styles and classes based on the 'side' prop
  const tabPositionClass = isLeft
    ? 'left-0 rounded-r-xl border-r border-cyan-400/40'
    : 'right-0 rounded-l-xl border-l border-cyan-400/40';
  const panelPositionClass = isLeft
    ? 'left-0 -translate-x-full border-r border-cyan-400/30'
    : 'right-0 translate-x-full border-l border-cyan-400/30';

  const chevronPositionClass = isLeft ? 'right-1' : 'left-1';
  const ledPositionClass = isLeft ? 'top-2 right-2' : 'top-2 left-2';
  const ChevronIcon = isLeft ? ChevronRight : ChevronLeft;

  return (
    <>
      {/* Side Tab */}
      <div
        ref={tabRef}
        className={`fixed top-1/2 z-50 flex h-[120px] w-[60px] -translate-y-1/2 cursor-pointer flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500/20 via-white/10 to-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.3)] backdrop-blur-xl ${tabPositionClass}`}
        onClick={handleClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverOut}
      >
        {/* Scanning Line Animation */}
        <div
          ref={scanLineRef}
          className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#00FFFF]"
        />

        {/* Dynamic Icon */}
        <div ref={iconRef} className="mb-2">
          {icon}
        </div>

        {/* Dynamic Text */}
        <div className="text-xs font-bold tracking-wider text-cyan-400 [text-orientation:mixed] [text-shadow:0_0_8px_#00FFFF] [writing-mode:vertical-rl]">
          {label}
        </div>

        {/* Chevron Indicator */}
        <div ref={chevronRef} className={`absolute ${chevronPositionClass}`}>
          <ChevronIcon
            size={16}
            className="text-cyan-400 [filter:drop-shadow(0_0_4px_#00FFFF)]"
          />
        </div>

        {/* LED Pulse Effect */}
        <div
          ref={ledRef}
          className={`absolute h-2 w-2 rounded-full bg-cyan-400 opacity-30 shadow-[0_0_10px_#00FFFF] ${ledPositionClass}`}
        />
      </div>

      {/* HUD Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 z-40 h-full w-[320px] bg-gradient-to-br from-cyan-500/15 via-white/5 to-cyan-500/15 shadow-[0_0_50px_rgba(0,255,255,0.2)] backdrop-blur-2xl ${panelPositionClass}`}
      >
        {/* Panel content is passed via children */}
        {children}
      </div>
    </>
  );
}
