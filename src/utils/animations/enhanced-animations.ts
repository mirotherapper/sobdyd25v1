'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsapDevTools } from '../gsap-devtools';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Enhanced animation utilities with debugging support
 */
export class EnhancedAnimations {
  private static debugMode = process.env.NODE_ENV === 'development';

  /**
   * Fade animations with debugging
   */
  static fadeIn(
    targets: gsap.TweenTarget,
    options: {
      duration?: number;
      delay?: number;
      ease?: string;
      debug?: boolean;
      debugName?: string;
    } = {}
  ) {
    const {
      duration = 0.8,
      delay = 0,
      ease = 'power2.out',
      debug = false,
      debugName = 'FadeIn',
    } = options;

    const tween = gsap.fromTo(
      targets,
      { opacity: 0 },
      {
        opacity: 1,
        duration,
        delay,
        ease,
        ...(debug &&
          this.debugMode && {
            onStart: () => console.log(`▶️ ${debugName} started`),
            onComplete: () => console.log(`✅ ${debugName} completed`),
          }),
      }
    );

    if (debug && this.debugMode) {
      gsapDevTools.monitorPerformance(debugName, () => {});
    }

    return tween;
  }

  /**
   * Slide animations with debugging
   */
  static slideInFromBottom(
    targets: gsap.TweenTarget,
    options: {
      duration?: number;
      delay?: number;
      distance?: number;
      ease?: string;
      debug?: boolean;
      debugName?: string;
    } = {}
  ) {
    const {
      duration = 0.8,
      delay = 0,
      distance = 50,
      ease = 'power2.out',
      debug = false,
      debugName = 'SlideInBottom',
    } = options;

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: distance },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease,
        ...(debug &&
          this.debugMode && {
            onStart: () => console.log(`▶️ ${debugName} started`),
            onComplete: () => console.log(`✅ ${debugName} completed`),
          }),
      }
    );

    if (debug && this.debugMode) {
      gsapDevTools.monitorPerformance(debugName, () => {});
    }

    return tween;
  }

  /**
   * Stagger animations with debugging
   */
  static staggerIn(
    targets: gsap.TweenTarget,
    options: {
      duration?: number;
      stagger?: number;
      ease?: string;
      from?: 'start' | 'center' | 'end';
      debug?: boolean;
      debugName?: string;
    } = {}
  ) {
    const {
      duration = 0.6,
      stagger = 0.1,
      ease = 'power2.out',
      from = 'start',
      debug = false,
      debugName = 'StaggerIn',
    } = options;

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration,
        ease,
        stagger: {
          amount: stagger,
          from,
        },
        ...(debug &&
          this.debugMode && {
            onStart: () => console.log(`▶️ ${debugName} started`),
            onComplete: () => console.log(`✅ ${debugName} completed`),
          }),
      }
    );

    if (debug && this.debugMode) {
      gsapDevTools.monitorPerformance(debugName, () => {});
    }

    return tween;
  }

  /**
   * Scroll-triggered animations with debugging
   */
  static scrollTriggerAnimation(
    targets: gsap.TweenTarget,
    options: {
      trigger?: string | Element;
      start?: string;
      end?: string;
      scrub?: boolean | number;
      markers?: boolean;
      animation: gsap.core.Tween;
      debug?: boolean;
      debugName?: string;
    }
  ) {
    const {
      trigger,
      start = 'top bottom-=100',
      end = 'bottom top+=100',
      scrub = false,
      markers = false,
      animation,
      debug = false,
      debugName = 'ScrollTrigger',
    } = options;

    const scrollTrigger = ScrollTrigger.create({
      trigger,
      start,
      end,
      scrub,
      markers: markers && this.debugMode,
      animation,
      ...(debug &&
        this.debugMode && {
          onEnter: () => console.log(`🎯 ${debugName} entered viewport`),
          onLeave: () => console.log(`🎯 ${debugName} left viewport`),
          onEnterBack: () => console.log(`🎯 ${debugName} entered back`),
          onLeaveBack: () => console.log(`🎯 ${debugName} left back`),
        }),
    });

    if (debug && this.debugMode) {
      console.log(`🎯 ScrollTrigger created for ${debugName}`, {
        trigger,
        start,
        end,
        scrub,
      });
    }

    return scrollTrigger;
  }

  /**
   * Timeline with debugging
   */
  static createTimeline(
    options: {
      paused?: boolean;
      debug?: boolean;
      debugName?: string;
    } = {}
  ) {
    const { paused = false, debug = false, debugName = 'Timeline' } = options;

    if (debug && this.debugMode) {
      return gsapDevTools.createTimeline({ paused }, debugName);
    }

    return gsap.timeline({ paused });
  }

  /**
   * Hover animations with debugging
   */
  static createHoverAnimation(
    target: gsap.TweenTarget,
    options: {
      scale?: number;
      duration?: number;
      ease?: string;
      debug?: boolean;
      debugName?: string;
    } = {}
  ) {
    const {
      scale = 1.05,
      duration = 0.3,
      ease = 'power2.out',
      debug = false,
      debugName = 'HoverAnimation',
    } = options;

    const hoverIn = gsap.to(target, {
      scale,
      duration,
      ease,
      paused: true,
      ...(debug &&
        this.debugMode && {
          onStart: () => console.log(`🖱️ ${debugName} hover in`),
        }),
    });

    const hoverOut = gsap.to(target, {
      scale: 1,
      duration,
      ease,
      paused: true,
      ...(debug &&
        this.debugMode && {
          onStart: () => console.log(`🖱️ ${debugName} hover out`),
        }),
    });

    return { hoverIn, hoverOut };
  }

  /**
   * Debug all active animations
   */
  static debugActiveAnimations() {
    if (!this.debugMode) return;

    const activeTweens = gsap.getTweensOf('*');
    console.group('🎬 Active GSAP Animations');
    console.log(`Total active tweens: ${activeTweens.length}`);
    activeTweens.forEach((tween, index) => {
      console.log(`${index + 1}:`, {
        targets: tween.targets(),
        progress: tween.progress(),
        duration: tween.duration(),
        paused: tween.paused(),
      });
    });
    console.groupEnd();
  }
}

// Export enhanced animations
export const enhancedAnimations = EnhancedAnimations;
