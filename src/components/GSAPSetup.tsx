"use client";

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Draggable } from 'gsap/dist/Draggable';
import { TextPlugin } from 'gsap/dist/TextPlugin';
import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    ScrollTrigger,
    Draggable,
    TextPlugin,
    MotionPathPlugin,
    useGSAP
  );
}

export default function GSAPSetup() {
  useEffect(() => {
    // Global GSAP configuration
    gsap.config({
      force3D: true,
      nullTargetWarn: false,
      autoSleep: 60,
    });

    // Set default ease and duration
    gsap.defaults({
      ease: "power2.out",
      duration: 0.6
    });

    // Initialize ScrollTrigger refresh
    ScrollTrigger.refresh();

    console.log('🎬 GSAP Setup Complete with plugins:', {
      ScrollTrigger: !!ScrollTrigger,
      Draggable: !!Draggable,
      TextPlugin: !!TextPlugin,
      MotionPathPlugin: !!MotionPathPlugin,
      useGSAP: !!useGSAP
    });
  }, []);

  return null; // This component doesn't render anything
}
