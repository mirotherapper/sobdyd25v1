'use client';
import React from 'react';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-4xl rounded-lg bg-gray-800 p-8 shadow-lg">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Project Documentation
        </h1>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1. Project Overview</h2>
          <p className="mb-2 text-gray-300">
            This application is a white-label, multi-tenant DJ platform designed
            to manage music submissions for live shows. It features a submission
            system with Que-Up payments, an admin dashboard for managing
            playlists and trax, and a records library for archiving past shows
            and artist/song data.
          </p>
          <p className="text-gray-300">
            The primary goal is to provide a robust, scalable, and transparent
            platform for hosts to manage their shows and for artists to submit
            their music, with a focus on cost-efficiency and data integrity.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            1.1 Multi-Tenant Architecture Overview
          </h2>
          <p className="mb-2 text-gray-300">
            DoYouDJ is a fully automated multi-tenant DJ platform that processes
            URLs from multiple platforms through metadata extraction, TraxCard
            generation, admin review, and automated playlist management. Each
            client (like #TraxPlaya) operates as an independent instance with
            shared core infrastructure.
          </p>
          <h3 className="mt-4 mb-2 text-xl font-semibold">
            Multi-Tenant Architecture Flow:
          </h3>
          <pre className="mb-4 overflow-auto rounded-md bg-gray-700 p-4 text-sm">
            <code>
              Client Domain (traxplaya.com) → DNS Forwarding →
              traxplaya.doyoudj.com → Tenant Detection &rarr; Client
              Configuration &rarr; URL Submission &rarr; Platform Detection
              &rarr; Metadata Extraction &rarr; DoYouDJTraxCard Creation &rarr;
              TraxCardSubmission Format (with Payment Status) &rarr; Database
              Storage (tenant-isolated) &rarr; Admin Review &rarr; Queue
              Management (with Que-Up Priority) &rarr; Live Playlist &rarr; Show
              Archive &rarr; Master Library Sync
            </code>
          </pre>
          <h3 className="mt-4 mb-2 text-xl font-semibold">
            White-Label SaaS Benefits:
          </h3>
          <ul className="ml-4 list-inside list-disc text-gray-300">
            <li>
              <strong>Single Codebase</strong> - Centralized updates benefit all
              clients
            </li>
            <li>
              <strong>Client Branding</strong> - Custom themes, logos, and
              configurations
            </li>
            <li>
              <strong>Domain Protection</strong> - Core DoYouDJ infrastructure
              secured
            </li>
            <li>
              <strong>Scalable Revenue</strong> - Multiple client subscriptions
            </li>
            <li>
              <strong>Centralized Security</strong> - SSL and authentication
              managed centrally
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            1.2 Key Components & Terminology
          </h2>
          <ul className="ml-4 list-inside list-disc text-gray-300">
            <li>
              <strong>URL Submission</strong>: Raw URL from user (YouTube,
              Spotify, SoundCloud, Bandcamp, Local Files)
            </li>
            <li>
              <strong>Platform Detection</strong>: Identifies and validates
              platform-specific URLs
            </li>
            <li>
              <strong>DoYouDJTraxCard</strong>: Standardized trax object with
              normalized metadata
            </li>
            <li>
              <strong>TraxCardSubmission</strong>: Proprietary file format for
              searchable, reusable trax data
            </li>
            <li>
              <strong>Tenant Isolation</strong>: Client-specific data separation
              and configuration
            </li>
            <li>
              <strong>Domain Masking</strong>: DNS forwarding from client
              domains to DoYouDJ subdomains
            </li>
            <li>
              <strong>Admin Review</strong>: Manual approval/rejection with
              comprehensive dashboard
            </li>
            <li>
              <strong>Queue Management</strong>: Drag-and-drop playlist ordering
              with Que-Up priority system
            </li>
            <li>
              <strong>Live Playlist</strong>: Real-time playback with M3U8
              streaming and HLS support
            </li>
            <li>
              <strong>Show Archive</strong>: Automated archiving with historical
              data and M3U8 export
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1.3 Que-Up System</h2>
          <p className="mb-2 text-gray-300">
            The platform incorporates a flexible Que-Up system for trax
            submissions, allowing hosts to offer various levels of service.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg bg-gray-700 shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Que-Up
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Features
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">🌟 VIP Priority</td>
                  <td className="px-4 py-2">$50.00</td>
                  <td className="px-4 py-2">Highest priority placement</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">⚡ Skip the Line</td>
                  <td className="px-4 py-2">$25.00</td>
                  <td className="px-4 py-2">Jump ahead in queue</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">🎫 General Admission</td>
                  <td className="px-4 py-2">$10.00</td>
                  <td className="px-4 py-2">Standard queue position</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">🆓 Free Submission</td>
                  <td className="px-4 py-2">Free</td>
                  <td className="px-4 py-2">Basic submission</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">🎲 Random Reset</td>
                  <td className="px-4 py-2">Free</td>
                  <td className="px-4 py-2">End-of-show engagement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            2. Technical Implementation
          </h2>
          <h3 className="mt-4 mb-2 text-xl font-semibold">
            Core System Status:
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg bg-gray-700 shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    System
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Key Features
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Platform Detection</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    YouTube, Spotify, SoundCloud, Bandcamp, Local files
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">API Integration</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    Multi-platform metadata extraction
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Metadata Storage</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    MongoDB with TraxCardSubmission format
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Admin Review</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    Dashboard with approve/reject workflow
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Queue Management</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    Drag-and-drop with tier priority system
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">M3U8 Generation</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    HLS streaming with Video.js integration
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Live Playlist</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    Admin player with real-time controls
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Archive System</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    Show finalization with historical data
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="mt-6 mb-2 text-xl font-semibold">
            Implementation Architecture:
          </h3>
          <pre className="mb-4 overflow-auto rounded-md bg-gray-700 p-4 text-sm">
            <code>
              /lib/ ├── platform-detector.ts # Platform detection logic ├──
              url-processor.ts # URL processing pipeline ├──
              trax-card-format.ts # TraxCardSubmission format ├── database.ts
              # MongoDB abstraction layer └── mongodb-schema.ts # Database
              schemas /app/api/ ├── process-url/route.ts # URL processing
              endpoint ├── playlist-management/ # Queue management API └──
              finalize-show/route.ts # Archive system API /components/ ├──
              submission/que-up-accordion-cards.tsx # Que-Up system (LOCKED) ├──
              playlist-system/video-player/ # Admin player components └── admin/
              # Admin dashboard components
            </code>
          </pre>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            2.1 Cost-Effective Implementation Strategy
          </h2>
          <p className="mb-2 text-gray-300">
            The platform is designed with cost-effectiveness in mind,
            particularly for its initial implementation.
          </p>
          <h3 className="mt-4 mb-2 text-xl font-semibold">
            Current Implementation (FREE QUE-UP - $0/month):
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg bg-gray-700 shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Feature
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Implementation
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">MongoDB Community</td>
                  <td className="px-4 py-2">✅ ACTIVE</td>
                  <td className="px-4 py-2">
                    Unlimited database, local storage
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">TraxCardSubmission Format</td>
                  <td className="px-4 py-2">✅ ACTIVE</td>
                  <td className="px-4 py-2">
                    Essential metadata with search indexing
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Platform Detection</td>
                  <td className="px-4 py-2">✅ ACTIVE</td>
                  <td className="px-4 py-2">
                    YouTube, Spotify, SoundCloud, Bandcamp, Local
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Admin Player M3U8</td>
                  <td className="px-4 py-2">✅ ACTIVE</td>
                  <td className="px-4 py-2">HLS streaming with Video.js</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Queue Management</td>
                  <td className="px-4 py-2">✅ ACTIVE</td>
                  <td className="px-4 py-2">
                    Drag-and-drop with Que-Up priority
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Archive System</td>
                  <td className="px-4 py-2">✅ ACTIVE</td>
                  <td className="px-4 py-2">
                    Show finalization with historical data
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="mt-6 mb-2 text-xl font-semibold">
            Future Expansion Options:
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg bg-gray-700 shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Upgrade
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Cost
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Trigger
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Benefits
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">MongoDB Atlas</td>
                  <td className="px-4 py-2">$9/month</td>
                  <td className="px-4 py-2">Database &gt; 1GB</td>
                  <td className="px-4 py-2">
                    Cloud hosting, automated backups
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">CDN Storage</td>
                  <td className="px-4 py-2">$0.02/GB/month</td>
                  <td className="px-4 py-2">Global audience</td>
                  <td className="px-4 py-2">Content delivery, versioning</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Audio Fingerprinting</td>
                  <td className="px-4 py-2">$0.001/trax</td>
                  <td className="px-4 py-2">1000+ submissions/month</td>
                  <td className="px-4 py-2">
                    Duplicate detection, similarity search
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Master Database Sync</td>
                  <td className="px-4 py-2">$50/month</td>
                  <td className="px-4 py-2">Multiple shows</td>
                  <td className="px-4 py-2">Cross-show artist/trax sharing</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Advanced Analytics</td>
                  <td className="px-4 py-2">$100/month</td>
                  <td className="px-4 py-2">Business insights needed</td>
                  <td className="px-4 py-2">Spotify/YouTube API integration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            2.2 Performance & Quality
          </h2>
          <h3 className="mt-4 mb-2 text-xl font-semibold">
            Code Quality Metrics:
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg bg-gray-700 shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Metric
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">ESLint Compliance</td>
                  <td className="px-4 py-2">✅ OPTIMIZED</td>
                  <td className="px-4 py-2">
                    useCallback optimizations implemented
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">TypeScript Coverage</td>
                  <td className="px-4 py-2">✅ COMPLETE</td>
                  <td className="px-4 py-2">
                    Full type safety across codebase
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Performance</td>
                  <td className="px-4 py-2">✅ OPTIMIZED</td>
                  <td className="px-4 py-2">
                    Function memoization and efficient rendering
                  </td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="px-4 py-2">Testing</td>
                  <td className="px-4 py-2">✅ COMPREHENSIVE</td>
                  <td className="px-4 py-2">
                    Unit tests and integration testing
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="mt-6 mb-2 text-xl font-semibold">
            Performance Optimizations Completed:
          </h3>
          <ul className="ml-4 list-inside list-disc text-gray-300">
            <li>
              <strong>useCallback Implementation</strong> - Enhanced submission
              form, admin page, dual media player
            </li>
            <li>
              <strong>Memory Management</strong> - Proper cleanup and disposal
              patterns
            </li>
            <li>
              <strong>Bundle Optimization</strong> - Removed unused imports and
              dependencies
            </li>
            <li>
              <strong>Database Indexing</strong> - MongoDB collections properly
              indexed for performance
            </li>
          </ul>
          <h3 className="mt-6 mb-2 text-xl font-semibold">
            Testing & Validation:
          </h3>
          <pre className="mb-4 overflow-auto rounded-md bg-gray-700 p-4 text-sm">
            <code>{`# API Testing
curl -X POST http://localhost:3002/api/process-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://open.spotify.com/track/2FNvO68ODWQD4XOmm6gzEB", "submissionType": "Free"}'

# Run ESLint
npm run lint

# Run Tests
npm test`}</code>
          </pre>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            2.3 GSAP Animation System & Design Elements
          </h2>
          <p className="mb-4 text-gray-300">
            #TraxPlaya utilizes GSAP (GreenSock Animation Platform) for advanced
            animations and interactive design elements throughout the
            application.
          </p>

          <h3 className="mt-4 mb-2 text-xl font-semibold">
            ✅ Installed GSAP Plugins:
          </h3>
          <div className="mb-4 rounded-md bg-gray-700 p-4">
            <ul className="ml-4 list-inside list-disc space-y-1 text-green-400">
              <li>
                <strong>GSAP Core</strong> - Main animation engine (v3.13.0)
              </li>
              <li>
                <strong>@gsap/react</strong> - React integration with useGSAP
                hook (v2.1.2)
              </li>
              <li>
                <strong>ScrollTrigger</strong> - Scroll-based animations and
                triggers
              </li>
              <li>
                <strong>Draggable</strong> - Drag and drop functionality for
                admin interface
              </li>
              <li>
                <strong>TextPlugin</strong> - Advanced text animations and
                effects
              </li>
              <li>
                <strong>MotionPathPlugin</strong> - SVG path-based animations
              </li>
            </ul>
          </div>

          <h3 className="mt-4 mb-2 text-xl font-semibold">
            🎨 Design Elements Implementation:
          </h3>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md bg-gray-700 p-4">
              <h4 className="mb-2 font-semibold text-cyan-400">
                UI Components
              </h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Glass morphism effects</li>
                <li>• LED lighting animations</li>
                <li>• Shimmer and glow effects</li>
                <li>• Accordion expansions</li>
                <li>• Hover state transitions</li>
              </ul>
            </div>
            <div className="rounded-md bg-gray-700 p-4">
              <h4 className="mb-2 font-semibold text-purple-400">
                Interactive Features
              </h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Drag & drop playlist management</li>
                <li>• Smooth scroll animations</li>
                <li>• Text reveal effects</li>
                <li>• SVG path animations</li>
                <li>• Contextual hover feedback</li>
              </ul>
            </div>
          </div>

          <h3 className="mt-4 mb-2 text-xl font-semibold">
            🚀 Advanced Animation Features:
          </h3>
          <div className="mb-4 rounded-md bg-gray-700 p-4">
            <pre className="overflow-auto text-sm text-gray-300">
              <code>{`// Example GSAP Implementation
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

const { contextSafe } = useGSAP({ scope: container });

const animateCardHover = contextSafe((cardId, isHovering) => {
  gsap.to(card, {
    y: isHovering ? -2 : 0,
    scale: isHovering ? 1.01 : 1,
    duration: 0.3,
    ease: 'power2.out',
  });
});`}</code>
            </pre>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            2.4 Development History & Milestones
          </h2>
          <p className="mb-2 text-gray-300">
            The #TraxPlaya platform has undergone significant development,
            achieving several pivotal milestones to reach its current
            production-ready state.
          </p>
          <h3 className="mt-4 mb-2 text-xl font-semibold">
            Revolutionary Features Implemented:
          </h3>
          <ul className="ml-4 list-inside list-disc text-gray-300">
            <li>
              <strong>Random Reset System</strong> - Industry-first end-of-show
              engagement.
            </li>
            <li>
              <strong>Accordion Que-Up Cards</strong> - Premium UX with smooth
              animations.
            </li>
            <li>
              <strong>Enhanced Master Media Player</strong> - Ultimate
              consolidation of media player components (9 to 1).
            </li>
            <li>
              <strong>Dynamic Media Player Integration</strong> - Advanced
              database connectivity with media type detection.
            </li>
            <li>
              <strong>Smart URL Processing</strong> - Multi-platform metadata
              extraction.
            </li>
            <li>
              <strong>Design Lock System</strong> - Protected approved
              components.
            </li>
            <li>
              <strong>Performance Optimized</strong> - ESLint compliance and
              useCallback optimization.
            </li>
          </ul>

          <h3 className="mt-6 mb-2 text-xl font-semibold">
            Current Status & Completed Features:
          </h3>
          <ul className="ml-4 list-inside list-disc text-gray-300">
            <li>
              <strong>Core URL Processing Pipeline:</strong> Fully implemented
              and working (Platform Detection, TraxCard Creation, Database
              Integration).
            </li>
            <li>
              <strong>Cost-Effective Architecture:</strong> Free tier
              implementation ready for production testing.
            </li>
            <li>
              <strong>End-to-End Workflow Testing:</strong> Core workflow fully
              tested and validated (URL Submission to Live Playlist).
            </li>
            <li>
              <strong>MongoDB Atlas Integration:</strong> Configured and ready
              for final testing.
            </li>
            <li>
              <strong>Master Archive System:</strong> Fully operational with
              show finalization and historical data management.
            </li>
            <li>
              <strong>Enhanced Master Media Player Consolidation:</strong>{' '}
              Achieved 95.5% file reduction while preserving all functionality.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            3. Data Models (MongoDB Schemas)
          </h2>
          <ul className="list-inside list-disc text-gray-300">
            <li>
              <strong>Song:</strong> Stores metadata for individual music
              trax.
            </li>
            <li>
              <strong>Artist:</strong> Stores artist profiles, including bio,
              social links, and associated songs.
            </li>
            <li>
              <strong>Submission:</strong> Records initial trax submissions
              from artists, including URL, Que-Up, and status.
            </li>
            <li>
              <strong>Playlist:</strong> Represents a collection of
              `PlaylistItem`s, used for live queues and archived shows.
            </li>
            <li>
              <strong>PlaylistItem:</strong> An entry within a playlist, linking
              to a `Song` and its status/position.
            </li>
            <li>
              <strong>Host:</strong> Stores host profiles, their current
              subscription, and configured payment gateways.
            </li>
            <li>
              <strong>HostSubscription:</strong> Manages host subscription Que-Ups
              and payment details.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. API Endpoints</h2>
          <ul className="list-inside list-disc text-gray-300">
            <li>
              <code>/api/submissions</code>: Handle trax submissions (POST,
              GET). Requires authentication.
            </li>
            <li>
              <code>/api/playlist-management</code>: Manage playlists (POST,
              GET, PUT, DELETE). Requires host/admin authentication.
            </li>
            <li>
              <code>/api/artists</code>: Fetch all artists (GET). Publicly
              accessible.
            </li>
            <li>
              <code>/api/artists/[id]</code>: Fetch single artist by ID (GET).
              Publicly accessible.
            </li>
            <li>
              <code>/api/songs</code>: Fetch all songs (GET). Publicly
              accessible.
            </li>
            <li>
              <code>/api/hosts</code>: Manage host profiles and subscriptions
              (POST, GET, PUT). POST is open for registration, GET/PUT require
              host/admin authentication.
            </li>
            <li>
              <code>/api/hosts/[id]</code>: Fetch single host by ID (GET).
              Requires host/admin authentication.
            </li>
            <li>
              <code>/api/host-config</code>: Fetch public payment configuration
              for a host (GET). Publicly accessible.
            </li>
            <li>
              <code>/api/track-management</code>: Handle drag-and-drop trax
              movements on Admin page (POST). Requires host/admin
              authentication.
            </li>
            <li>
              <code>/api/submissions/update-payment</code>: Update a
              submission&apos;s payment status after successful payment (POST).
              Requires authentication.
            </li>
            <li>
              <code>/api/artist-profile-sync</code>: Trigger artist profile
              synchronization (POST). Requires authentication.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            5. Payment Integration
          </h2>
          <p className="mb-2 text-gray-300">
            The application supports flexible payment options for client
            submissions to hosts, configured by each host:
          </p>
          <ul className="list-inside list-disc text-gray-300">
            <li>
              <strong>PayPal (Placeholder):</strong> UI elements are in place to
              allow hosts to configure their PayPal for receiving payments. Full
              integration with PayPal&apos;s API for processing payments is a
              future enhancement.
            </li>
            <li>
              <strong>Custom Link (Placeholder):</strong> Hosts can provide a
              custom payment link (e.g., a link to their personal payment page
              or a crypto wallet address) for manual payments. The application
              will direct users to this link.
            </li>
          </ul>
          <p className="mt-2 text-red-400">
            <strong>Security Note:</strong> For production environments,
            sensitive API keys (e.g., PayPal Client Secrets) should be stored in
            a secure secrets manager (e.g., Google Secret Manager) and not
            directly in the database. This implementation stores them in the
            database for proof-of-concept purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            6. Host Subscription & Transparent Fees
          </h2>
          <p className="mb-2 text-gray-300">
            The platform aims to build trust with hosts through transparent fee
            structures. While the full subscription management for hosts (your
            billing) is a future phase, the Host Dashboard includes placeholders
            for:
          </p>
          <ul className="list-inside list-disc text-gray-300">
            <li>Displaying current subscription tier.</li>
            <li>Showing estimated database usage costs.</li>
            <li>
              Calculating a transparent platform fee (e.g., 5% of paid
              submissions after initial free uses).
            </li>
          </ul>
          <p className="mt-2 text-gray-300">
            The actual deduction and integration with Square Pay, PayPal, and
            Web3 for host subscriptions will be implemented in a dedicated
            future development phase.
          </p>
        </section>
      </div>
    </div>
  );
}
