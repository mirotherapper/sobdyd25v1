'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { gsapDevTools } from '../utils/gsap-devtools';

/**
 * Custom hook for GSAP debugging and development
 */
export function useGSAPDebug(componentName?: string) {
  const debugRef = useRef<HTMLElement>(null);
  const isDebugMode = process.env.NODE_ENV === 'development';

  // Debug timeline creation
  const createDebugTimeline = (vars?: gsap.TimelineVars, name?: string) => {
    const timelineName = name || `${componentName || 'Component'} Timeline`;
    return gsapDevTools.createTimeline(vars, timelineName);
  };

  // Debug element visualization
  const visualizeElement = (element?: Element) => {
    if (!isDebugMode) return;

    const target = element || debugRef.current;
    if (target) {
      gsapDevTools.visualizeElement(target);
    }
  };

  // Performance monitoring
  const monitorPerformance = (name: string, callback: () => void) => {
    if (!isDebugMode) return callback();

    const perfName = `${componentName || 'Component'} - ${name}`;
    gsapDevTools.monitorPerformance(perfName, callback);
  };

  // Log animation info
  const logAnimationInfo = (timeline: gsap.core.Timeline, name?: string) => {
    if (!isDebugMode) return;

    const animationName = name || `${componentName || 'Component'} Animation`;
    gsapDevTools.logTimelineInfo(timeline, animationName);
  };

  // Auto-log component mount/unmount
  useEffect(() => {
    if (isDebugMode && componentName) {
      console.log(`🎬 ${componentName} mounted with GSAP debugging enabled`);

      return () => {
        console.log(`🎬 ${componentName} unmounted`);
      };
    }
  }, [componentName, isDebugMode]);

  return {
    debugRef,
    createDebugTimeline,
    visualizeElement,
    monitorPerformance,
    logAnimationInfo,
    isDebugMode,
    // Quick access to dev tools
    devTools: gsapDevTools,
  };
}
