"use client";

import React, { useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  useGSAP(() => {
    gsap.to(scanLineRef.current, { y: 120, duration: 2, repeat: -1, yoyo: true, ease: "none" });
    gsap.to(ledRef.current, { opacity: 1, scale: 1.2, duration: 1, repeat: -1, yoyo: true, ease: "power2.inOut" });

    if (iconRef.current) {
      if (iconAnimation === 'rotate') {
        gsap.to(iconRef.current, { rotation: 360, duration: 4, repeat: -1, ease: "none" });
      }
      if (iconAnimation === 'rotate' || iconAnimation === 'pulse') {
        gsap.to(iconRef.current, { scale: 1.1, duration: 2, repeat: -1, yoyo: true, ease: "power2.inOut" });
      }
    }
  }, { scope: tabRef, dependencies: [iconAnimation] });

  // Animations that depend on the open/closed state
  useGSAP(() => {
    const panelWidth = 320;
    gsap.to(panelRef.current, { x: isOpen ? 0 : (isLeft ? -panelWidth : panelWidth), duration: 0.6, ease: "power3.inOut" });
    gsap.to(chevronRef.current, { x: isOpen ? (isLeft ? -5 : 5) : 0, rotation: isOpen ? 180 : 0, duration: 0.3, ease: "power2.inOut" });
  }, { dependencies: [isOpen, isLeft] });

  // GSAP-based interaction handlers
  const handleHover = () => gsap.to(tabRef.current, { scale: 1.05, duration: 0.2 });
  const handleHoverOut = () => gsap.to(tabRef.current, { scale: 1, duration: 0.2 });
  const handleClick = () => {
    gsap.to(tabRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    onToggle();
  };

  // Dynamically set styles and classes based on the 'side' prop
  const tabPositionClass = isLeft ? 'left-0' : 'right-0';
  const tabStyle = {
    borderLeft: isLeft ? 'none' : '1px solid rgba(0, 255, 255, 0.4)',
    borderRight: isLeft ? '1px solid rgba(0, 255, 255, 0.4)' : 'none',
    borderRadius: isLeft ? '0 12px 12px 0' : '12px 0 0 12px',
  };

  const panelPositionClass = isLeft ? 'left-0' : 'right-0';
  const panelStyle = {
    transform: `translateX(${isLeft ? '-320px' : '320px'})`,
    borderLeft: isLeft ? 'none' : '1px solid rgba(0, 255, 255, 0.3)',
    borderRight: isLeft ? '1px solid rgba(0, 255, 255, 0.3)' : 'none',
  };
  
  const chevronPositionClass = isLeft ? 'right-1' : 'left-1';
  const ledPositionClass = isLeft ? 'top-2 right-2' : 'top-2 left-2';
  const ChevronIcon = isLeft ? ChevronRight : ChevronLeft;

  return (
    <>
      {/* Side Tab */}
      <div
        ref={tabRef}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 cursor-pointer ${tabPositionClass}`}
        onClick={handleClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverOut}
        style={{
          background: `linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 75%, rgba(0, 255, 255, 0.2) 100%)`,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)',
          width: '60px',
          height: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          ...tabStyle,
        }}
      >
        {/* Scanning Line Animation */}
        <div
          ref={scanLineRef}
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
            boxShadow: '0 0 10px #00FFFF',
          }}
        />

        {/* Dynamic Icon */}
        <div ref={iconRef} className="mb-2">
          {icon}
        </div>

        {/* Dynamic Text */}
        <div
          className="text-xs font-bold tracking-wider"
          style={{
            color: '#00FFFF',
            textShadow: '0 0 8px #00FFFF',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {label}
        </div>

        {/* Chevron Indicator */}
        <div ref={chevronRef} className={`absolute ${chevronPositionClass}`}>
          <ChevronIcon
            size={16}
            style={{
              color: '#00FFFF',
              filter: 'drop-shadow(0 0 4px #00FFFF)',
            }}
          />
        </div>

        {/* LED Pulse Effect */}
        <div
          ref={ledRef}
          className={`absolute w-2 h-2 rounded-full ${ledPositionClass}`}
          style={{
            background: '#00FFFF',
            boxShadow: '0 0 10px #00FFFF',
            opacity: 0.3,
          }}
        />
      </div>

      {/* HUD Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 h-full z-40 ${panelPositionClass}`}
        style={{
          width: '320px',
          background: `linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(255, 255, 255, 0.08) 25%, rgba(0, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.08) 75%, rgba(0, 255, 255, 0.15) 100%)`,
          backdropFilter: 'blur(25px)',
          boxShadow: '0 0 50px rgba(0, 255, 255, 0.2)',
          ...panelStyle,
        }}
      >
        {/* Panel content is passed via children */}
        {children}
      </div>
    </>
  );
}