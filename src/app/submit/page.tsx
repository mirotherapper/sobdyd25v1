/* DESIGN RECREATED FROM BACKUP - UTILIZING ENHANCED FORM */

import { TierAccordionCards } from "@/components/playlist-system/submission/tier-accordion-cards";
import { PromotionalBanner } from "@/components/playlist-system/submission/promotional-banner";
import { Suspense } from "react";

export default function SubmitPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden text-white bg-black"
    >
      {/* Background Element with Grid and Horizon Effect */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to top, transparent, rgba(0, 255, 255, 0.05), transparent),
            url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiPjwvcmVjdD4KPC9zdmc+'),
            linear-gradient(to bottom, black, rgba(128, 0, 128, 0.3), black)
          `,
          transform: 'perspective(1000px) rotateX(80deg)',
          transformOrigin: 'bottom',
          bottom: '-5%',
          opacity: 0.7,
        }}
      />
      
      <div className="container mx-auto px-4 pt-24 pb-32 relative z-10">
        <div className="max-w-[615px] mx-auto">
          {/* Tier Selection Cards */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <span className="ml-3 text-cyan-400">Loading submission tiers...</span>
            </div>
          }>
            <TierAccordionCards />
          </Suspense>

          {/* Promotional Banner */}
          <div className="mt-8">
            <PromotionalBanner />
          </div>
        </div>
      </div>
    </div>
  );
}
