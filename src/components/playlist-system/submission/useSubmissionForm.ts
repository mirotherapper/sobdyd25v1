import { useState } from 'react';
import { detectPlatform, extractMetadata } from '../../../../lib/url-utils';

interface TrackPreview {
  platform: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  url: string;
}

export interface Tier {
  id: string;
  name: string;
  price: number;
}

export type MessageType = 'success' | 'error' | 'info';

export interface Message {
  text: string;
  type: MessageType;
}

interface UseSubmissionFormProps {
  userId: string | null | undefined;
  isSignedIn: boolean | undefined;
  paymentConfig: any;
  tierData: Tier[];
  setMessage: (message: Message | null) => void;
  onSuccess: () => void;
}

export const useSubmissionForm = ({
  userId,
  isSignedIn,
  paymentConfig,
  tierData,
  setMessage,
  onSuccess,
}: UseSubmissionFormProps) => {
  const [url, setUrl] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [startTime, setStartTime] = useState('');
  const [trackPreview, setTrackPreview] = useState<TrackPreview | null>(null);
  const [isTrackConfirmed, setIsTrackConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [tierForPayment, setTierForPayment] = useState<Tier | null>(null);

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setIsTrackConfirmed(false);
    setTrackPreview(null);
    setMessage(null);

    if (newUrl.trim()) {
      try {
        const platform = detectPlatform(newUrl);
        const metadata = extractMetadata(newUrl, platform);

        setTrackPreview({
          platform,
          title: metadata.title || 'Track Title',
          artist: metadata.artist || 'Artist Name',
          duration: metadata.duration || '3:45',
          thumbnail: metadata.thumbnail || '/default-album-art.jpg',
          url: newUrl,
        });
      } catch (error) {
        console.error("Error processing URL:", error);
        setMessage({ text: "Could not process the provided URL. Please check if it's a valid link.", type: 'error' });
      }
    }
  };

  const handleTrackConfirm = () => {
    setIsTrackConfirmed(true);
    setMessage({ text: 'Track confirmed! Now select your submission tier.', type: 'info' });
  };

  const handleTierSelect = (tierId: string) => {
    const wasExpanded = expandedTier === tierId;
    setSelectedTier(tierId);

    if (wasExpanded) {
      setExpandedTier(null);
    } else {
      setExpandedTier(tierId);
    }
  };

  const resetForm = () => {
    setUrl('');
    setSubmissionMessage('');
    setStartTime('');
    setSelectedTier('');
    setExpandedTier(null);
    setTrackPreview(null);
    setIsTrackConfirmed(false);
  };
  
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setTierForPayment(null);
    // The success message is already shown, so we just reset.
    setMessage({ text: "Your submission is in the queue. You can submit another track.", type: 'info' });
    resetForm();
  };

  const submitTrack = async (data: any, isPaid: boolean) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        setMessage({ text: `Submission failed: Server returned an invalid response (Status: ${response.status})`, type: 'error' });
        return;
      }

      if (response.ok) {
        if (isPaid) {
          setMessage({ text: 'Submission recorded! Please complete payment.', type: 'success' });
          onSuccess();
        } else {
          setMessage({ text: 'Submission successful! Your track is in the queue.', type: 'success' });
          resetForm();
          onSuccess();
        }
      } else {
        const errorMessage = result?.error || 'An unknown error occurred.';
        setMessage({ text: `Submission failed: ${errorMessage}`, type: 'error' });
      }
    } catch (error: any) {
      console.error("Submission network error:", error);
      setMessage({ text: 'A network error occurred. Please check your connection and try again.', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* Temporarily disabled for testing
    if (!isSignedIn) {
      setMessage('Please sign in to submit a track.');
      return;
    }
    */

    if (!url.trim()) {
      setMessage({ text: 'Please enter a track URL.', type: 'error' });
      return;
    }

    if (!isTrackConfirmed) {
      setMessage({ text: 'Please confirm the track preview first.', type: 'error' });
      return;
    }

    if (!selectedTier) {
      setMessage({ text: 'Please select a submission tier.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const platform = detectPlatform(url);
      const metadata = extractMetadata(url, platform);
      const selectedTierObject = tierData.find(t => t.id === selectedTier);
      if (!selectedTierObject) {
        setMessage({ text: 'Could not find selected tier details.', type: 'error' });
        return;
      }

      const dataToSend = {
        url,
        submissionType: tierData.find(t => t.id === selectedTier)?.name || 'Free',
        submissionMessage,
        startTime,
        platform,
        metadata,
        submittedBy: userId,
      };

      const tierPrice = selectedTierObject.price || 0;

      if (tierPrice > 0) {
        if (paymentConfig?.paypal || paymentConfig?.customLink) {
          await submitTrack(dataToSend, true);
          setTierForPayment(selectedTierObject);
          setIsPaymentModalOpen(true);
        } else {
          setMessage({ text: 'No payment method configured for this host for paid tiers.', type: 'error' });
        }
      } else {
        await submitTrack(dataToSend, false);
      }
    } catch (error) {
      console.error("Error during submission preparation:", error);
      setMessage({ text: 'An unexpected error occurred while preparing your submission. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    url,
    setUrl,
    submissionMessage,
    setSubmissionMessage,
    startTime,
    setStartTime,
    trackPreview,
    isTrackConfirmed,
    isSubmitting,
    selectedTier,
    expandedTier,
    handleUrlChange,
    handleTrackConfirm,
    handleTierSelect,
    handleSubmit,
    isPaymentModalOpen,
    tierForPayment,
    handleClosePaymentModal,
  };
};