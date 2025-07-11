import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
// import { SocketProvider } from "../lib/socket/context"; // Temporarily disabled
// import GSAPSetup from "@/components/GSAPSetup"; // Temporarily disabled

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StayOnBeat Submission',
  description: 'Submit your trax to be featured live.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-gray-900 text-gray-200`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
