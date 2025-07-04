"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StandardContainer } from "@/components/ui/standard-container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Music, Check, X, RefreshCw, History, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { PayPalPaymentButton } from "@/components/payment/paypal-payment-button";
import { useRouter } from "next/navigation";

interface TrackPreview {
  title: string;
  artist: string;
  duration?: number;
  artworkUrl?: string;
  platform: string;
  description?: string;
}

interface PreviousSubmission {
  id: string;
  artist_name: string;
  song_title: string;
  url: string;
  platform?: string;
  status: string;
  created_at: string;
}

interface EnhancedSubmissionFormProps {
  onSuccess?: () => void;
  className?: string;
  preselectedTier?: "VIP" | "GA" | "Free" | "Skip";
  compact?: boolean;
}

export function EnhancedSubmissionForm({ onSuccess, className = "", preselectedTier = "Free", compact = false }: EnhancedSubmissionFormProps) {
  // Form state
  const [submissionMethod, setSubmissionMethod] = useState<"url" | "file">("url");
  const [songUrl, setSongUrl] = useState("");
  const [artistName, setArtistName] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [albumImage, setAlbumImage] = useState<File | null>(null);
  const [albumImageUrl, setAlbumImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [submissionType] = useState(preselectedTier);
  const [notes, setNotes] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // User identity field
  const [chatName, setChatName] = useState("");

  // Preview and processing state
  const [trackPreview, setTrackPreview] = useState<TrackPreview | null>(null);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewConfirmed, setPreviewConfirmed] = useState(false);

  // Previous submissions state
  const [previousSubmissions, setPreviousSubmissions] = useState<PreviousSubmission[]>([]);
  const [showPreviousSubmissions, setShowPreviousSubmissions] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Success state
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successData, setSuccessData] = useState<{
    artistName: string;
    songTitle: string;
    artworkUrl?: string;
    userName: string;
  } | null>(null);

  // User authentication and router
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  // Load previous submissions and user chat name when user is signed in
  useEffect(() => {
    if (isSignedIn && user) {
      loadPreviousSubmissions();
      // Load existing chat name from user profile if available
      const existingChatName = user.publicMetadata?.chatName as string;
      if (existingChatName) {
        setChatName(existingChatName);
      }
      // Don't set fallback - let user enter their actual chat name
    }
  }, [isSignedIn, user]);

  const loadPreviousSubmissions = async () => {
    setLoadingPrevious(true);
    try {
      const response = await fetch("/api/submissions");
      if (response.ok) {
        const data = await response.json();
        setPreviousSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Failed to load previous submissions:", error);
    } finally {
      setLoadingPrevious(false);
    }
  };

  // Process URL to extract metadata
  const processUrl = async (url: string) => {
    if (!url.trim()) return;

    setIsProcessingUrl(true);
    setTrackPreview(null);
    setPreviewConfirmed(false);

    try {
      const response = await fetch('/api/process-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          submissionType: submissionType,
          userId: user?.id,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      const result = await response.json();

      if (result.success && result.data && result.data.metadata) {
        const metadata = result.data.metadata;
        const preview: TrackPreview = {
          title: metadata.title || "Unknown Title",
          artist: metadata.artist || "Unknown Artist",
          duration: metadata.duration,
          artworkUrl: metadata.artworkUrl,
          platform: result.data.platform || "unknown",
          description: metadata.description,
        };

        setTrackPreview(preview);
        setArtistName(preview.artist);
        setSongTitle(preview.title);

        toast.success("Track metadata extracted successfully!");
      } else {
        toast.error(result.error || "Failed to process URL");
      }
    } catch (error) {
      console.error("Error processing URL:", error);
      toast.error("Failed to process URL");
    } finally {
      setIsProcessingUrl(false);
    }
  };

  // Handle URL input change with debounced processing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (songUrl && songUrl.includes('http')) {
        processUrl(songUrl);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [songUrl]);

  // Upload album image
  const uploadAlbumImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'artwork');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setAlbumImageUrl(result.url);
      toast.success("Album artwork uploaded successfully!");

    } catch (error) {
      console.error('Image upload error:', error);
      toast.error("Failed to upload album artwork");
      setAlbumImage(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Upload audio file
  const uploadAudioFile = async (file: File) => {
    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'audio');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setSelectedFileUrl(result.url);
      toast.success("Audio file uploaded successfully!");

    } catch (error) {
      console.error('Audio upload error:', error);
      toast.error("Failed to upload audio file");
      setSelectedFile(null);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Check for duplicate submissions
  const checkForDuplicate = (url: string): PreviousSubmission | null => {
    return previousSubmissions.find(sub => sub.url === url) || null;
  };

  // Handle previous submission selection
  const selectPreviousSubmission = (submission: PreviousSubmission) => {
    setSongUrl(submission.url);
    setArtistName(submission.artist_name);
    setSongTitle(submission.song_title);
    setShowPreviousSubmissions(false);
    
    // Create preview from previous submission
    setTrackPreview({
      title: submission.song_title,
      artist: submission.artist_name,
      platform: submission.platform || "unknown",
    });
    setPreviewConfirmed(true);

    toast.success("Previous submission selected");
  };

  // Handle URL input click to auto-paste from clipboard
  const handleUrlInputClick = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.match(/^https?:\/\/[^\s<>"']+$/)) {
        setSongUrl(clipboardText);
        toast.info("URL pasted from clipboard");
        processUrl(clipboardText);
      }
    } catch (err) {
      console.error("Clipboard access failed:", err);
    }
  };

  // Payment handlers
  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSubmissionId(null);

    toast.success("Payment completed! Your track is now active in the queue.", {
      style: {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.3))',
        border: '1px solid rgba(34, 197, 94, 0.5)',
        color: '#ffffff',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
      },
      duration: 5000,
    });

    // Reset form after successful payment
    setSongUrl("");
    setArtistName("");
    setSongTitle("");
    setNotes("");
    if (!isSignedIn) {
      setChatName("");
    }
    setSelectedFile(null);
    setSelectedFileUrl(null);
    setAlbumImage(null);
    setAlbumImageUrl(null);
    setTrackPreview(null);
    setPreviewConfirmed(false);

    if (onSuccess) onSuccess();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSubmissionId(null);

    toast.info("Payment cancelled. Your submission is saved but not active until payment is completed. You can resubmit or edit your submission.");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Chat name is optional - no validation needed

    if (submissionMethod === "url") {
      if (!songUrl.trim()) {
        toast.error("Please enter a song URL");
        return;
      }
      if (!previewConfirmed && trackPreview) {
        toast.error("Please confirm the track preview before submitting");
        return;
      }
    } else {
      if (!selectedFile) {
        toast.error("Please select an audio file");
        return;
      }
      if (!selectedFileUrl) {
        toast.error("Please wait for audio file to finish uploading");
        return;
      }
      if (!artistName.trim() || !songTitle.trim()) {
        toast.error("Please enter artist name and song title for file uploads");
        return;
      }
    }

    // Check for duplicates (URL submissions only)
    if (submissionMethod === "url") {
      const duplicate = checkForDuplicate(songUrl);
      if (duplicate) {
        toast.info("This track was already submitted. Using previous submission data.");
      }
    }

    setIsSubmitting(true);

    // Force stop spinning after 15 seconds
    const forceStopTimeout = setTimeout(() => {
      setIsSubmitting(false);
      toast.error("Submission timed out - MongoDB connection issue. Please try again later.");
    }, 15000);

    try {
      let submissionData: Record<string, string | null> = {
        submission_type: submissionType,
        notes: notes,
        chat_name: chatName,
        submission_method: submissionMethod,
      };

      if (submissionMethod === "url") {
        submissionData = {
          ...submissionData,
          artist_name: trackPreview?.artist || "Unknown Artist",
          song_title: trackPreview?.title || "Unknown Title",
          url: songUrl,
        };
      } else {
        submissionData = {
          ...submissionData,
          artist_name: artistName,
          song_title: songTitle,
          audio_file_url: selectedFileUrl,
          artwork_url: albumImageUrl,
        };
      }

      console.log("🚀 Sending submission to API...", submissionData);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("📡 API Response status:", response.status);
      console.log("📡 API Response:", response);

      if (response.ok) {
        console.log("✅ Response OK - processing success...");
        const result = await response.json();

        // Check if payment is required for this tier
        if (submissionType !== "Free") {
          setSubmissionId(result.submission?.id);
          setShowPayment(true);
          toast.success("Track submitted! Please complete payment to activate.", {
            style: {
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.3))',
              border: '1px solid rgba(251, 191, 36, 0.5)',
              color: '#ffffff',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)',
            },
            duration: 5000,
          });
        } else {
          // Get user name and track name for personalized message
          const userName = chatName || user?.firstName || "Artist";
          const trackName = submissionMethod === "url" ?
            (trackPreview?.title || "your track") :
            (songTitle || "your track");

          toast.success(`Congratulations ${userName}! Your track "${trackName}" has been added to the queue.`, {
            style: {
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.3))',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
            },
            duration: 6000,
          });

          // Trigger confetti animation
          if (typeof window !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '9999';
            document.body.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;

              // Simple confetti effect
              const particles: Array<{x: number, y: number, vx: number, vy: number, color: string, size: number}> = [];
              const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#00ffff', '#22c55e'];

              for (let i = 0; i < 100; i++) {
                particles.push({
                  x: Math.random() * canvas.width,
                  y: -10,
                  vx: (Math.random() - 0.5) * 4,
                  vy: Math.random() * 3 + 2,
                  color: colors[Math.floor(Math.random() * colors.length)],
                  size: Math.random() * 4 + 2
                });
              }

              const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                particles.forEach((particle, index) => {
                  particle.x += particle.vx;
                  particle.y += particle.vy;
                  particle.vy += 0.1; // gravity

                  ctx.fillStyle = particle.color;
                  ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

                  if (particle.y > canvas.height) {
                    particles.splice(index, 1);
                  }
                });

                if (particles.length > 0) {
                  requestAnimationFrame(animate);
                } else {
                  document.body.removeChild(canvas);
                }
              };

              animate();
            }
          }

          // Reset form for free submissions
          setSongUrl("");
          setArtistName("");
          setSongTitle("");
          setNotes("");
          // Only clear chat name if user is not logged in
          if (!isSignedIn) {
            setChatName("");
          }
          setSelectedFile(null);
          setSelectedFileUrl(null);
          setAlbumImage(null);
          setAlbumImageUrl(null);
          setTrackPreview(null);
          setPreviewConfirmed(false);

          // Reload previous submissions
          loadPreviousSubmissions().catch(console.error);

          if (onSuccess) onSuccess();
        }
      } else {
        console.log("❌ API Error - Response not ok");
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        console.log("❌ Error details:", error);
        toast.error(error.error || "Submission failed - please try again", {
          style: {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.3))',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',
          },
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "Network error - please check your connection and try again";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timed out - MongoDB connection issue. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, {
        style: {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.3))',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          color: '#ffffff',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',
        },
        duration: 5000,
      });
    } finally {
      console.log("🔄 Finally block - clearing timeout and stopping submission");
      clearTimeout(forceStopTimeout);
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Compact form content */}
        {/* Submission Method Toggle */}
        <div className="space-y-2">
          <Label className="text-blue-300 font-semibold text-sm">Submission Method</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={submissionMethod === "url" ? "default" : "outline"}
              onClick={() => setSubmissionMethod("url")}
              size="sm"
              className={submissionMethod === "url"
                ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                : "border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
              }
            >
              🔗 URL
            </Button>
            <Button
              type="button"
              variant={submissionMethod === "file" ? "default" : "outline"}
              onClick={() => setSubmissionMethod("file")}
              size="sm"
              className={submissionMethod === "file"
                ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                : "border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
              }
            >
              📁 File
            </Button>
          </div>
        </div>

        {/* URL Submission Fields */}
        {submissionMethod === "url" && (
          <div className="space-y-2">
            <Label htmlFor="songUrl" className="text-blue-300 font-semibold text-sm">
              Song URL *
            </Label>
            <div className="relative">
              <Input
                id="songUrl"
                type="url"
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="bg-black/40 border-cyan-500/30 focus:border-cyan-500 text-white pr-10"
                required
              />
              {isProcessingUrl && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-cyan-400" />
              )}
            </div>
          </div>
        )}

        {/* Chat Name Field - Compact */}
        <div className="space-y-2">
          <Label htmlFor="chatName" className="text-blue-300 font-semibold text-sm">
            Chat Name *
          </Label>
          <Input
            id="chatName"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder="Your chat username"
            className="bg-black/40 border-cyan-500/30 focus:border-cyan-500 text-white"
            required
          />
        </div>

        {/* Submit Button - Compact */}
        <button
          type="submit"
          disabled={isSubmitting || isProcessingUrl || (!previewConfirmed && !!trackPreview)}
          className="w-full relative overflow-hidden rounded-lg py-2 px-4 font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Track"
          )}
        </button>
      </form>
    );
  }

  return (
    <StandardContainer variant="public" className="p-6">
      <style jsx>{`
        @keyframes preview-fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .preview-card {
          animation: preview-fade-in 0.3s ease-out !important;
          animation-duration: 0.3s !important;
        }

        /* Override any global animation speed settings for form elements */
        .submission-form * {
          animation-duration: inherit !important;
        }

        .submission-form .preview-card {
          animation-duration: 0.3s !important;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="submission-form space-y-6">
        {/* URL Submission Fields */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              id="songUrl"
              type="url"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              onClick={handleUrlInputClick}
              placeholder="https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                border: '2px solid #00FFFF',
                borderRadius: '8px',
                color: '#00FFFF',
                textShadow: '0 0 10px #00FFFF',
                boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
                paddingRight: '40px'
              }}
              className="text-white"
              required
            />
            {isProcessingUrl && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-cyan-400" />
            )}
          </div>
        </div>

        {/* File Upload Fields */}
        {submissionMethod === "file" && (
          <div className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="audioFile" className="text-blue-300 font-semibold">
                Audio File *
              </Label>
              <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className={`rounded-full p-2 ${isUploadingAudio ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                      {isUploadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        {isUploadingAudio && " - Uploading..."}
                        {selectedFileUrl && " - Uploaded ✓"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedFileUrl(null);
                      }}
                      className="border-red-400 text-red-400 hover:bg-red-400/10"
                      disabled={isUploadingAudio}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-cyan-300 mb-1">Drop your audio file here or click to browse</p>
                    <p className="text-xs text-gray-400">MP3, WAV, FLAC, M4A (max 100MB)</p>
                    <input
                      id="audioFile"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setSelectedFile(file);
                          uploadAudioFile(file);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                      onClick={() => document.getElementById('audioFile')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry Fields for File Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="artistName" className="text-blue-300 font-semibold">
                  Artist Name *
                </Label>
                <Input
                  id="artistName"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Enter artist name"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid #00FFFF',
                    borderRadius: '8px',
                    color: '#00FFFF',
                    textShadow: '0 0 10px #00FFFF',
                    boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
                  }}
                  className="text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="songTitle" className="text-blue-300 font-semibold">
                  Song Title *
                </Label>
                <Input
                  id="songTitle"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Enter song title"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid #00FFFF',
                    borderRadius: '8px',
                    color: '#00FFFF',
                    textShadow: '0 0 10px #00FFFF',
                    boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
                  }}
                  className="text-white"
                  required
                />
              </div>
            </div>

            {/* Album Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="albumImage" className="text-blue-300 font-semibold">
                Album Artwork (Optional)
              </Label>
              <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-4 text-center hover:border-cyan-500/50 transition-colors">
                {albumImage ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(albumImage)}
                        alt="Album artwork preview"
                        className="w-16 h-16 rounded object-cover border border-cyan-500/30"
                      />
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{albumImage.name}</p>
                      <p className="text-xs text-gray-400">
                        {(albumImage.size / (1024 * 1024)).toFixed(2)} MB
                        {isUploadingImage && " - Uploading..."}
                        {albumImageUrl && " - Uploaded ✓"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlbumImage(null);
                        setAlbumImageUrl(null);
                      }}
                      className="border-red-400 text-red-400 hover:bg-red-400/10"
                      disabled={isUploadingImage}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-cyan-300 mb-1">Drop your image file here or click to browse</p>
                    <p className="text-xs text-gray-400">JPG, PNG, GIF (max 10MB)</p>
                    <input
                      id="albumImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setAlbumImage(file);
                          uploadAlbumImage(file);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                      onClick={() => document.getElementById('albumImage')?.click()}
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Track Preview */}
        {trackPreview && (
          <Card className="preview-card bg-black/60 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                {trackPreview.artworkUrl && (
                  <img
                    src={trackPreview.artworkUrl}
                    alt="Track artwork"
                    className="w-24 h-24 rounded border border-cyan-500/30 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 mx-4">
                  <h3 className="font-semibold text-white">{trackPreview.title}</h3>
                  <p className="text-cyan-300">{trackPreview.artist.replace(/\s*-\s*Topic.*$/i, '').replace(/\s*-\s*topic.*$/i, '').trim()}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                      {trackPreview.platform}
                    </Badge>
                  </div>

                  {trackPreview.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {trackPreview.description}
                    </p>
                  )}
                </div>

                {!previewConfirmed && (
                  <div className="flex flex-col justify-between h-24 space-y-1">
                  <button
                    type="button"
                    onClick={() => setPreviewConfirmed(true)}
                    className="relative overflow-hidden rounded-lg py-1 px-3 font-semibold text-white transition-all duration-600"
                    style={{
                      background: `
                        linear-gradient(135deg, rgba(0, 100, 0, 0.9) 0%, rgba(0, 150, 0, 0.8) 50%, rgba(0, 100, 0, 0.9) 100%),
                        repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255, 255, 255, 0.02) 1px, rgba(255, 255, 255, 0.02) 2px)
                      `,
                      border: '2px solid #00FF00',
                      boxShadow: `
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.3),
                        0 0 10px rgba(0, 255, 0, 0.5),
                        0 0 20px rgba(0, 255, 0, 0.3)
                      `,
                      textShadow: '0 0 10px #00FF00'
                    }}
                  >
                    <Check className="h-4 w-4 mr-1 inline" />
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => processUrl(songUrl)}
                    className="relative overflow-hidden rounded-lg py-1 px-3 font-semibold text-white transition-all duration-600"
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
                        0 0 20px rgba(0, 255, 255, 0.3)
                      `,
                      textShadow: '0 0 10px #00FFFF'
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1 inline" />
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackPreview(null);
                      setArtistName("");
                      setSongTitle("");
                    }}
                    className="relative overflow-hidden rounded-lg py-1 px-3 font-semibold text-white transition-all duration-600"
                    style={{
                      background: `
                        linear-gradient(135deg, rgba(100, 0, 0, 0.9) 0%, rgba(150, 0, 0, 0.8) 50%, rgba(100, 0, 0, 0.9) 100%),
                        repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255, 255, 255, 0.02) 1px, rgba(255, 255, 255, 0.02) 2px)
                      `,
                      border: '2px solid #FF0000',
                      boxShadow: `
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.3),
                        0 0 10px rgba(255, 0, 0, 0.5),
                        0 0 20px rgba(255, 0, 0, 0.3)
                      `,
                      textShadow: '0 0 10px #FF0000'
                    }}
                  >
                    <X className="h-4 w-4 mr-1 inline" />
                    Clear
                  </button>
                  </div>
                )}

                {previewConfirmed && (
                  <div className="flex flex-col items-center justify-center h-24 text-green-400">
                    <Check className="h-6 w-6 mb-1" />
                    <span className="text-xs text-center">Confirmed</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Name Field */}
        <div className="space-y-2">
          <Input
            id="chatName"
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
            className="text-white"
          />
        </div>

        {/* Additional Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Input
                    type="text"
                    maxLength={1}
                    className="w-6 h-8 text-center text-lg font-bold p-0"
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #00FFFF',
                      borderRadius: '4px',
                      color: '#00FFFF',
                      textShadow: '0 0 8px #00FFFF',
                      boxShadow: '0 0 8px rgba(0, 255, 255, 0.4)',
                      lineHeight: '1',
                      fontFamily: '"Courier New", "Lucida Console", "Monaco", "Consolas", monospace',
                      fontWeight: '900'
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value && parseInt(value) <= 5) {
                        e.target.value = value;
                        const nextInput = e.target.nextElementSibling as HTMLInputElement;
                        if (nextInput && nextInput.tagName === 'INPUT') {
                          nextInput.focus();
                        }
                      } else {
                        e.target.value = '';
                      }
                    }}
                  />
                  <Input
                    type="text"
                    maxLength={1}
                    className="w-6 h-8 text-center text-lg font-bold p-0"
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #00FFFF',
                      borderRadius: '4px',
                      color: '#00FFFF',
                      textShadow: '0 0 8px #00FFFF',
                      boxShadow: '0 0 8px rgba(0, 255, 255, 0.4)',
                      lineHeight: '1',
                      fontFamily: '"Courier New", "Lucida Console", "Monaco", "Consolas", monospace',
                      fontWeight: '900'
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value) {
                        e.target.value = value;
                        const nextInput = e.target.nextElementSibling?.nextElementSibling as HTMLInputElement;
                        if (nextInput && nextInput.tagName === 'INPUT') {
                          nextInput.focus();
                        }
                      }
                    }}
                  />
                  <span className="text-cyan-400 text-lg font-bold px-1" style={{ textShadow: '0 0 8px #00FFFF' }}>:</span>
                  <Input
                    type="text"
                    maxLength={1}
                    className="w-6 h-8 text-center text-lg font-bold p-0"
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #00FFFF',
                      borderRadius: '4px',
                      color: '#00FFFF',
                      textShadow: '0 0 8px #00FFFF',
                      boxShadow: '0 0 8px rgba(0, 255, 255, 0.4)',
                      lineHeight: '1',
                      fontFamily: '"Courier New", "Lucida Console", "Monaco", "Consolas", monospace',
                      fontWeight: '900'
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value && parseInt(value) <= 5) {
                        e.target.value = value;
                        const nextInput = e.target.nextElementSibling as HTMLInputElement;
                        if (nextInput && nextInput.tagName === 'INPUT') {
                          nextInput.focus();
                        }
                      } else {
                        e.target.value = '';
                      }
                    }}
                  />
                  <Input
                    type="text"
                    maxLength={1}
                    className="w-6 h-8 text-center text-lg font-bold p-0"
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #00FFFF',
                      borderRadius: '4px',
                      color: '#00FFFF',
                      textShadow: '0 0 8px #00FFFF',
                      boxShadow: '0 0 8px rgba(0, 255, 255, 0.4)',
                      lineHeight: '1',
                      fontFamily: '"Courier New", "Lucida Console", "Monaco", "Consolas", monospace',
                      fontWeight: '900'
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value) {
                        e.target.value = value;
                      }
                    }}
                  />
                </div>
                <Label htmlFor="startTime" className="text-cyan-400 font-semibold" style={{ textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF' }}>
                  Start Time (Optional)
                </Label>
              </div>
            </div>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Message or comments"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                border: '2px solid #00FFFF',
                borderRadius: '8px',
                color: '#00FFFF',
                textShadow: '0 0 10px #00FFFF',
                boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
              }}
              className="text-white h-24"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isProcessingUrl}
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Track"
          )}
        </button>
      </form>
    </StandardContainer>
  );
}
