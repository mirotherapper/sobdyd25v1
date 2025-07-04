"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
// import {
//   Zap,
//   ChevronLeft,
//   ChevronRight
// } from "lucide-react";

interface HUDLeftTabProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function HUDLeftTab({ isOpen, onToggle }: HUDLeftTabProps) {
  const tabRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const powerIconRef = useRef<HTMLDivElement>(null);
  const ledRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Scanning line animation
    if (scanLineRef.current) {
      gsap.to(scanLineRef.current, {
        y: 120,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "none"
      });
    }

    // Power icon pulse
    if (powerIconRef.current) {
      gsap.to(powerIconRef.current, {
        scale: 1.1,
        opacity: 1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }

    // LED pulse
    if (ledRef.current) {
      gsap.to(ledRef.current, {
        opacity: 1,
        scale: 1.2,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }
  });

  useGSAP(() => {
    // Panel slide animation
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        x: isOpen ? 0 : -320,
        duration: 0.6,
        ease: "power3.inOut"
      });
    }

    // Chevron rotation
    if (chevronRef.current) {
      gsap.to(chevronRef.current, {
        x: isOpen ? -5 : 0,
        rotation: isOpen ? 180 : 0,
        duration: 0.3,
        ease: "power2.inOut"
      });
    }
  }, [isOpen]);

  const handleHover = () => {
    if (tabRef.current) {
      gsap.to(tabRef.current, { scale: 1.05, duration: 0.2 });
    }
  };

  const handleHoverOut = () => {
    if (tabRef.current) {
      gsap.to(tabRef.current, { scale: 1, duration: 0.2 });
    }
  };

  const handleClick = () => {
    if (tabRef.current) {
      gsap.to(tabRef.current, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    }
    onToggle();
  };

  return (
    <>
      {/* Left Side Tab */}
      <div
        ref={tabRef}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 cursor-pointer"
        onClick={handleClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverOut}
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(0, 255, 255, 0.2) 0%,
              rgba(255, 255, 255, 0.1) 25%,
              rgba(0, 255, 255, 0.05) 50%,
              rgba(255, 255, 255, 0.1) 75%,
              rgba(0, 255, 255, 0.2) 100%
            )
          `,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 255, 0.4)',
          borderLeft: 'none',
          borderRadius: '0 12px 12px 0',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)',
          width: '60px',
          height: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Scanning Line Animation */}
        <div
          ref={scanLineRef}
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
            boxShadow: '0 0 10px #00FFFF'
          }}
        />

        {/* Power Icon */}
        <div ref={powerIconRef} className="mb-2" style={{ opacity: 0.7 }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#00FFFF',
              filter: 'drop-shadow(0 0 8px #00FFFF)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          />
        </div>

        {/* POWER Text */}
        <div
          className="text-xs font-bold tracking-wider"
          style={{
            color: '#00FFFF',
            textShadow: '0 0 8px #00FFFF',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          POWER
        </div>

        {/* Chevron Indicator */}
        <div ref={chevronRef} className="absolute right-1">
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#00FFFF',
              filter: 'drop-shadow(0 0 4px #00FFFF)',
              clipPath: 'polygon(0 0, 100% 50%, 0 100%)'
            }}
          />
        </div>

        {/* LED Pulse Effect */}
        <div
          ref={ledRef}
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{
            background: '#00FFFF',
            boxShadow: '0 0 10px #00FFFF',
            opacity: 0.3
          }}
        />
      </div>

      {/* Left HUD Panel */}
      <div
        ref={panelRef}
        className="fixed left-0 top-0 h-full z-40"
        style={{
          transform: 'translateX(-320px)',
          width: '320px',
          background: `
            linear-gradient(135deg, 
              rgba(0, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.08) 25%,
              rgba(0, 255, 255, 0.05) 50%,
              rgba(255, 255, 255, 0.08) 75%,
              rgba(0, 255, 255, 0.15) 100%
            )
          `,
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderLeft: 'none',
          boxShadow: '0 0 50px rgba(0, 255, 255, 0.2)'
        }}
      >
        <div className="p-6 h-full">
          <h2
            className="text-2xl font-bold mb-6"
            style={{
              color: '#00FFFF',
              textShadow: '0 0 15px #00FFFF'
            }}
          >
            <div className="inline mr-3 w-7 h-7 bg-cyan-400" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            POWER CONTROLS
          </h2>

          <div className="space-y-4">
            <button
              className="w-full p-4 rounded-lg border transition-all duration-300 relative overflow-hidden hover:scale-98"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 100, 255, 0.1))',
                borderColor: 'rgba(0, 255, 255, 0.3)',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(0, 255, 255, 0.6)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                  duration: 0.3
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(0, 255, 255, 0.3)',
                  boxShadow: 'none',
                  duration: 0.3
                });
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <div className="mr-3 w-5 h-5 bg-cyan-400" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                System Status
              </span>
            </button>

            <button
              className="w-full p-4 rounded-lg border transition-all duration-300 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(255, 0, 100, 0.1))',
                borderColor: 'rgba(255, 0, 255, 0.3)',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(255, 0, 255, 0.6)',
                  boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
                  duration: 0.3
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(255, 0, 255, 0.3)',
                  boxShadow: 'none',
                  duration: 0.3
                });
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <div className="mr-3 w-5 h-5 bg-cyan-400" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                Audio Controls
              </span>
            </button>

            <button
              className="w-full p-4 rounded-lg border transition-all duration-300 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 0, 0.1), rgba(255, 150, 0, 0.1))',
                borderColor: 'rgba(255, 255, 0, 0.3)',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(255, 255, 0, 0.6)',
                  boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)',
                  duration: 0.3
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  borderColor: 'rgba(255, 255, 0, 0.3)',
                  boxShadow: 'none',
                  duration: 0.3
                });
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <div className="mr-3 w-5 h-5 bg-cyan-400" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                Power Management
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
