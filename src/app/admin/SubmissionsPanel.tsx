"use client";

import React, { useState, useEffect } from 'react';
import { SubmissionData } from '../../../lib/types';
import { CheckCircle, XCircle, Clock, Music } from 'lucide-react';
import { detectPlatform } from '../../../lib/url-utils';

interface SubmissionsPanelProps {
  isVisible: boolean;
}

export const SubmissionsPanel: React.FC<SubmissionsPanelProps> = ({ isVisible }) => {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      fetchSubmissions();
    }
  }, [isVisible]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/submissions?status=pending');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      const response = await fetch('/api/submissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      
      if (response.ok) {
        fetchSubmissions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error approving submission:', error);
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const response = await fetch('/api/submissions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      
      if (response.ok) {
        fetchSubmissions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="p-6 h-full bg-[rgba(26,26,46,0.9)] backdrop-blur-[20px]">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400 [text-shadow:0_0_15px_#00FFFF]">
        <Music className="inline mr-3" size={28} />
        PENDING SUBMISSIONS
      </h2>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/10 rounded-lg p-4 h-24"></div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p>No pending submissions</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {submissions.map((submission) => (
            <div key={submission._id} className="bg-white/5 rounded-lg p-4 border border-cyan-400/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {submission.metadata?.artwork && (
                      <img 
                        src={submission.metadata.artwork} 
                        alt="Track artwork" 
                        className="w-12 h-12 rounded-md mr-3"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-white">
                        {submission.metadata?.title || 'Unknown Track'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {submission.metadata?.artist || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Platform:</strong> {detectPlatform(submission.url)}</p>
                    <p><strong>Tier:</strong> {submission.submissionType}</p>
                    {submission.submission_message && (
                      <p><strong>Message:</strong> {submission.submission_message}</p>
                    )}
                    <p><strong>URL:</strong> 
                      <a href={submission.url} target="_blank" rel="noopener noreferrer" 
                         className="text-cyan-400 hover:underline ml-1">
                        {submission.url.substring(0, 50)}...
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleApprove(submission._id)}
                    className="p-2 bg-green-600/20 border border-green-500/50 rounded-lg hover:bg-green-600/30 transition-colors"
                    title="Approve"
                  >
                    <CheckCircle size={20} className="text-green-400" />
                  </button>
                  <button
                    onClick={() => handleReject(submission._id)}
                    className="p-2 bg-red-600/20 border border-red-500/50 rounded-lg hover:bg-red-600/30 transition-colors"
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
