'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SubmissionData } from '../../lib/types';
import Image from 'next/image';
import { CheckCircle, XCircle, Clock, Music } from 'lucide-react';
import { detectPlatform } from '../../lib/url-utils';
// import { useRealTimeSubmissions } from '../../lib/hooks/useRealTimeSubmissions'; // Temporarily disabled
import { gsap } from 'gsap';

interface SubmissionsPanelProps {
  isVisible: boolean;
}

export const SubmissionsPanel: React.FC<SubmissionsPanelProps> = ({
  isVisible,
}) => {
  const submissionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  // Temporarily disabled real-time hook
  const submissions: any[] = [];
  const approveSubmission = (id: string) => console.log('Approve:', id);
  const rejectSubmission = (id: string) => console.log('Reject:', id);
  const isConnected = false;
  const isLoading = false;

  // GSAP animation for new submissions
  useEffect(() => {
    if (submissions.length > 0) {
      submissions.forEach(submission => {
        const element = submissionRefs.current[submission.id];
        if (element) {
          gsap.fromTo(
            element,
            { opacity: 0, y: 20, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              ease: 'power2.out',
              delay: 0.1,
            }
          );
        }
      });
    }
  }, [submissions]);

  const handleApprove = async (submissionId: string) => {
    // Animate approval
    const element = submissionRefs.current[submissionId];
    if (element) {
      gsap.to(element, {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    }

    try {
      approveSubmission(submissionId);
      // Real-time hook handles the update
    } catch (error) {
      console.error('Error approving submission:', error);
    }
  };

  const handleReject = async (submissionId: string) => {
    // Animate rejection
    const element = submissionRefs.current[submissionId];
    if (element) {
      gsap.to(element, {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        scale: 0.98,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    }

    try {
      rejectSubmission(submissionId);
      // Real-time hook handles the update
    } catch (error) {
      console.error('Error rejecting submission:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="h-full bg-[rgba(26,26,46,0.9)] p-6 backdrop-blur-[20px]">
      <h2 className="mb-6 text-2xl font-bold text-cyan-400 [text-shadow:0_0_15px_#00FFFF]">
        <Music className="mr-3 inline" size={28} />
        PENDING SUBMISSIONS
        {!isConnected && (
          <span className="ml-2 animate-pulse text-xs text-red-400">
            (Real-time disconnected)
          </span>
        )}
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-white/10 p-4"
            ></div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p>No pending submissions</p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto">
          {submissions.map(submission => (
            <div
              key={submission.id}
              ref={el => {
                submissionRefs.current[submission.id] = el;
              }}
              className="rounded-lg border border-cyan-400/20 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center">
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-md bg-gray-700">
                      <Music size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {submission.title || 'Unknown Trax'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {submission.artist || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p>
                      <strong>Que-Up:</strong> {submission.tier}
                    </p>
                    <p>
                      <strong>Status:</strong> {submission.status}
                    </p>
                    {submission.submittedBy && (
                      <p>
                        <strong>Submitted by:</strong> {submission.submittedBy}
                      </p>
                    )}
                    <p>
                      <strong>Created:</strong>{' '}
                      {new Date(submission.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() => handleApprove(submission.id)}
                    className="rounded-lg border border-green-500/50 bg-green-600/20 p-2 transition-colors hover:bg-green-600/30"
                    title="Approve"
                  >
                    <CheckCircle size={20} className="text-green-400" />
                  </button>
                  <button
                    onClick={() => handleReject(submission.id)}
                    className="rounded-lg border border-red-500/50 bg-red-600/20 p-2 transition-colors hover:bg-red-600/30"
                    title="Reject"
                  >
                    <XCircle size={20} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
