'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Info } from 'lucide-react';
import { getAnalytics } from '@/lib/analytics/tracker';

interface ConsentBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  onAccept,
  onDecline,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or denied
    const consent = localStorage.getItem('analytics_consent');
    if (!consent) {
      setIsVisible(true);
    }

    // Listen for the custom event from analytics tracker
    const handleShowConsent = () => setIsVisible(true);
    window.addEventListener('show-analytics-consent', handleShowConsent);

    return () => {
      window.removeEventListener('show-analytics-consent', handleShowConsent);
    };
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const analytics = getAnalytics();
      analytics.grantConsent();
      
      setIsVisible(false);
      onAccept?.();
    } catch (error) {
      console.error('Error granting consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    const analytics = getAnalytics();
    analytics.revokeConsent();
    
    setIsVisible(false);
    onDecline?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-4xl rounded-lg border border-white/20 bg-black/80 p-6 backdrop-blur-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6 text-cyan-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              Analytics & Cookies Notice
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              We use analytics cookies to improve your experience and help us understand how you interact with StayOnBeat. 
              This helps us enhance the platform and provide better features for DJs and music lovers.
            </p>
            
            <div className="mt-4">
              <details className="text-sm text-gray-400">
                <summary className="cursor-pointer hover:text-gray-300">
                  What data do we collect?
                </summary>
                <div className="mt-2 pl-4">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Page views and navigation patterns</li>
                    <li>Music submission and playback interactions</li>
                    <li>Performance metrics (page load times, errors)</li>
                    <li>User engagement statistics (anonymized)</li>
                  </ul>
                  <p className="mt-2 text-xs">
                    We never collect personal information without your explicit consent, 
                    and all data is processed in accordance with GDPR regulations.
                  </p>
                </div>
              </details>
            </div>
          </div>
          
          <button
            onClick={handleDecline}
            className="flex-shrink-0 text-gray-400 hover:text-white"
            aria-label="Close banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-white transition-all hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Accept & Continue
          </button>
          
          <button
            onClick={handleDecline}
            className="rounded-lg border border-white/20 px-6 py-3 text-white transition-all hover:bg-white/10"
          >
            Decline
          </button>
          
          <a
            href="/privacy-policy"
            className="rounded-lg px-6 py-3 text-center text-gray-300 transition-all hover:text-white"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
