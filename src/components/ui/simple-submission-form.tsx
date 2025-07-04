"use client";

import React, { useState } from "react";

interface SimpleSubmissionFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function SimpleSubmissionForm({ onSuccess, className = "" }: SimpleSubmissionFormProps) {
  const [songUrl, setSongUrl] = useState("");
  const [chatName, setChatName] = useState("");
  const [submissionType, setSubmissionType] = useState("Free");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Track submitted successfully!");
      if (onSuccess) onSuccess();
    }, 2000);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Submit Your Track
        </h1>
        <p className="text-center text-gray-300">Choose your submission tier and get your music heard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <input
            type="url"
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '2px solid #00FFFF',
              borderRadius: '8px',
              color: '#00FFFF',
              textShadow: '0 0 10px #00FFFF',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
            }}
            className="w-full p-4 text-white"
            required
          />
        </div>

        {/* Tier Selection */}
        <div className="space-y-2">
          <select
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '2px solid #00FFFF',
              color: '#00FFFF',
              textShadow: '0 0 10px #00FFFF',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
            }}
            className="w-full p-4 text-white rounded-lg"
          >
            <option value="Free">🆓 Free Submission</option>
            <option value="GA">🎫 General Admission ($10)</option>
            <option value="Skip">⚡ Skip the Line ($25)</option>
            <option value="VIP">⭐ VIP Priority ($50)</option>
          </select>
        </div>

        {/* Chat Name */}
        <div className="space-y-2">
          <input
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder="Your YouTube/Twitch chat username (optional)"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '2px solid #00FFFF',
              borderRadius: '8px',
              color: '#00FFFF',
              textShadow: '0 0 10px #00FFFF',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
            }}
            className="w-full p-4 text-white"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Message or comments (optional)"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '2px solid #00FFFF',
              borderRadius: '8px',
              color: '#00FFFF',
              textShadow: '0 0 10px #00FFFF',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
            }}
            className="w-full p-4 text-white h-24 resize-vertical"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full relative overflow-hidden rounded-lg py-3 px-6 font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `
              linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(40, 40, 40, 0.8) 50%, rgba(0, 0, 0, 0.9) 100%),
              repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255, 255, 255, 0.02) 1px, rgba(255, 255, 255, 0.02) 2px)
            `,
            border: '2px solid #00FFFF',
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3),
              0 0 10px rgba(0, 255, 255, 0.5),
              0 0 20px rgba(0, 255, 255, 0.3),
              0 0 30px rgba(0, 255, 255, 0.1)
            `,
            textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          {isSubmitting ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            `Submit Track ${submissionType !== "Free" ? 
              `(${submissionType === "GA" ? "$10" : submissionType === "Skip" ? "$25" : "$50"})` : ""}`
          )}
        </button>
      </form>
    </div>
  );
}
