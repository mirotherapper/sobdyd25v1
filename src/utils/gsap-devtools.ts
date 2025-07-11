/**
 * GSAP Development Tools Utility
 * Provides debugging and visualization tools for GSAP animations
 */

import { gsap } from 'gsap';

export class GSAPDevTools {
  private static instance: GSAPDevTools;
  private isEnabled: boolean = false;

  private constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): GSAPDevTools {
    if (!GSAPDevTools.instance) {
      GSAPDevTools.instance = new GSAPDevTools();
    }
    return GSAPDevTools.instance;
  }

  /**
   * Enable GSAP global debugging
   */
  public enableGlobalDebugging(): void {
    if (!this.isEnabled) return;

    // Add global GSAP to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).gsap = gsap;
      (window as any).GSAPDevTools = this;
      console.log(
        '🎬 GSAP DevTools enabled. Access via window.gsap or window.GSAPDevTools'
      );
    }
  }

  /**
   * Log timeline information
   */
  public logTimelineInfo(timeline: gsap.core.Timeline, name?: string): void {
    if (!this.isEnabled) return;

    const info = {
      name: name || 'Timeline',
      duration: timeline.duration(),
      progress: timeline.progress(),
      time: timeline.time(),
      paused: timeline.paused(),
      reversed: timeline.reversed(),
      totalDuration: timeline.totalDuration(),
      children: timeline.getChildren(),
    };

    console.group(`🎬 ${info.name} Info`);
    console.table(info);
    console.groupEnd();
  }

  /**
   * Create a timeline with debugging capabilities
   */
  public createTimeline(
    vars?: gsap.TimelineVars,
    debugName?: string
  ): gsap.core.Timeline {
    const timeline = gsap.timeline(vars);

    if (this.isEnabled && debugName) {
      // Add debug markers
      timeline.eventCallback('onStart', () => {
        console.log(`▶️ ${debugName} started`);
      });

      timeline.eventCallback('onComplete', () => {
        console.log(`✅ ${debugName} completed`);
      });

      timeline.eventCallback('onUpdate', () => {
        console.log(
          `🔄 ${debugName} progress: ${(timeline.progress() * 100).toFixed(1)}%`
        );
      });
    }

    return timeline;
  }

  /**
   * Visualize element properties
   */
  public visualizeElement(element: Element): void {
    if (!this.isEnabled) return;

    const computedStyle = window.getComputedStyle(element);
    const gsapProps = gsap.getProperty(element);

    console.group(`🎯 Element Properties: ${element.tagName}`);
    console.log('Element:', element);
    console.log('Transform:', gsapProps('transform'));
    console.log('Opacity:', gsapProps('opacity'));
    console.log('X:', gsapProps('x'));
    console.log('Y:', gsapProps('y'));
    console.log('Scale X:', gsapProps('scaleX'));
    console.log('Scale Y:', gsapProps('scaleY'));
    console.log('Rotation:', gsapProps('rotation'));
    console.groupEnd();
  }

  /**
   * Performance monitoring for animations
   */
  public monitorPerformance(name: string, callback: () => void): void {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    callback();
    const endTime = performance.now();

    console.log(
      `⚡ ${name} execution time: ${(endTime - startTime).toFixed(2)}ms`
    );
  }

  /**
   * Kill all GSAP animations (useful for debugging)
   */
  public killAllAnimations(): void {
    if (!this.isEnabled) return;

    gsap.killTweensOf('*');
    console.log('🛑 All GSAP animations killed');
  }

  /**
   * Show animation timeline in console
   */
  public showTimelineStructure(timeline: gsap.core.Timeline): void {
    if (!this.isEnabled) return;

    const children = timeline.getChildren();
    console.group('🎬 Timeline Structure');
    children.forEach((child, index) => {
      console.log(
        `${index}: ${child.vars.targets?.[0]?.tagName || 'Unknown'} - Duration: ${child.duration()}s`
      );
    });
    console.groupEnd();
  }
}

// Export singleton instance
export const gsapDevTools = GSAPDevTools.getInstance();

// Auto-enable in development
if (typeof window !== 'undefined') {
  gsapDevTools.enableGlobalDebugging();
}
