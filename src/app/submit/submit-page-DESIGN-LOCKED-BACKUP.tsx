/* DESIGN UNLOCKED FOR FIXES - 2024-12-25 🔓 */

"use client";

import { TierAccordionCards } from "@/components/playlist-system/submission/tier-accordion-cards";
import { PromotionalBanner } from "@/components/playlist-system/submission/promotional-banner";
import { Suspense } from "react";

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900/30 to-black relative overflow-hidden text-white">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/30 to-black z-0"></div>

      {/* Add a horizon line effect */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-transparent via-[#00ffff]/5 to-transparent h-full w-full z-20"
        style={{
          transform: "perspective(1000px) rotateX(80deg)",
          transformOrigin: "bottom",
          bottom: "-5%",
          opacity: 0.7,
        }}
      ></div>

      {/* Grid pattern overlay - simplified */}
      <div className="absolute inset-0 opacity-20 z-10" style={{ 
        backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiPjwvcmVjdD4KPC9zdmc+')",
        backgroundRepeat: "repeat"
      }}></div>

      <div className="container mx-auto px-4 pt-24 pb-32 relative z-30">
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
