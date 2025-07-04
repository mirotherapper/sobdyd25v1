"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <>
      {/* Main Footer */}
      <footer className="bg-black text-white p-6 text-center text-sm mt-12">
        <div className="container mx-auto">
          <p className="text-gray-300">&copy; {new Date().getFullYear()} StayOnBeat. All rights reserved.</p>
          <p className="text-gray-500 text-xs mt-2">DoYouDj Trademarked Application & Copyrighted Program</p>
        </div>
      </footer>

      {/* Floating Admin Login Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/admin" className="admin-floating-button">
          <div className="relative w-9 h-9 bg-black/80 backdrop-blur-md rounded-full border border-gray-600/50 flex items-center justify-center group hover:scale-110 transition-all duration-300 shadow-2xl">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>

            {/* Admin Icon */}
            <div className="relative z-10 text-white font-bold text-sm group-hover:text-cyan-400 transition-colors duration-300">
              A
            </div>

            {/* Glass Reflection */}
            <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white/20 rounded-full blur-sm"></div>
          </div>
        </Link>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }

        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out;
        }

        .admin-floating-button:hover .bg-black\\/80 {
          background: rgba(0, 0, 0, 0.9);
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}
