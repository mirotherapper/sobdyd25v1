import { useState } from 'react';
import { detectPlatform, extractMetadata } from '../../../lib/url-utils';

interface TraxPreview {
  platform: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  url: string;
}

export interface QueUp {
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
  paymentConfig: unknown;
  queUpData: QueUp[];
  setMessage: (message: Message | null) => void;
  onSuccess: () => void;
}

export const useSubmissionForm = ({
  userId,
  paymentConfig,
  queUpData,
  setMessage,
  onSuccess,
}: UseSubmissionFormProps) => {
  const [url, setUrl] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [startTime, setStartTime] = useState('');
  const [traxPreview, setTraxPreview] = useState<TraxPreview | null>(null);
  const [isTraxConfirmed, setIsTraxConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQueUp, setSelectedQueUp] = useState<string>('');
  const [expandedQueUp, setExpandedQueUp] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [queUpForPayment, setQueUpForPayment] = useState<QueUp | null>(null);

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setIsTraxConfirmed(false);
    setTraxPreview(null);
    setMessage(null);

    if (newUrl.trim()) {
      try {
        const platform = detectPlatform(newUrl);
        const metadata = extractMetadata(newUrl, platform);

        setTraxPreview({
          platform,
          title: metadata.title || 'Trax Title',
          artist: metadata.artist || 'Artist Name',
          duration: metadata.duration ? metadata.duration.toString() : '3:45',
          thumbnail: metadata.artwork || '/default-album-art.jpg',
          url: newUrl,
        });
      } catch {
        console.error('Error processing URL:');
        setMessage({
          text: "Could not process the provided URL. Please check if it's a valid link.",
          type: 'error',
        });
      }
    }
  };

  const handleTraxConfirm = () => {
    setIsTraxConfirmed(true);
    setMessage({
      text: 'Trax confirmed! Now select your submission Que-Up.',
      type: 'info',
    });
  };

  const handleQueUpSelect = (queUpId: string) => {
    const wasExpanded = expandedQueUp === queUpId;
    setSelectedQueUp(queUpId);

    if (wasExpanded) {
      setExpandedQueUp(null);
    } else {
      setExpandedQueUp(queUpId);
    }
  };

  const resetForm = () => {
    setUrl('');
    setSubmissionMessage('');
    setStartTime('');
    setSelectedQueUp('');
    setExpandedQueUp(null);
    setTraxPreview(null);
    setIsTraxConfirmed(false);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setQueUpForPayment(null);
    // The success message is already shown, so we just reset.
    setMessage({
      text: 'Your submission is in the queue. You can submit another trax.',
      type: 'info',
    });
    resetForm();
  };

  const submitTrax = async (data: object, isPaid: boolean) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        setMessage({
          text: `Submission failed: Server returned an invalid response (Status: ${response.status})`,
          type: 'error',
        });
        return;
      }

      if (response.ok) {
        if (isPaid) {
          setMessage({
            text: 'Submission recorded! Please complete payment.',
            type: 'success',
          });
          onSuccess();
        } else {
          setMessage({
            text: 'Submission successful! Your trax is in the queue.',
            type: 'success',
          });
          resetForm();
          onSuccess();
        }
      } else {
        const errorMessage = result?.error || 'An unknown error occurred.';
        setMessage({
          text: `Submission failed: ${errorMessage}`,
          type: 'error',
        });
      }
    } catch (error: unknown) {
      console.error('Submission network error:', error);
      setMessage({
        text: 'A network error occurred. Please check your connection and try again.',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* Temporarily disabled for testing
    if (!isSignedIn) {
      setMessage('Please sign in to submit a trax.');
      return;
    }
    */

    if (!url.trim()) {
      setMessage({ text: 'Please enter a trax URL.', type: 'error' });
      return;
    }

    if (!isTraxConfirmed) {
      setMessage({
        text: 'Please confirm the trax preview first.',
        type: 'error',
      });
      return;
    }

    if (!selectedQueUp) {
      setMessage({ text: 'Please select a submission Que-Up.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const platform = detectPlatform(url);
      const metadata = extractMetadata(url, platform);
      const selectedQueUpObject = queUpData.find(q => q.id === selectedQueUp);
      if (!selectedQueUpObject) {
        setMessage({
          text: 'Could not find selected Que-Up details.',
          type: 'error',
        });
        return;
      }

      const dataToSend = {
        url,
        submissionType:
          queUpData.find(q => q.id === selectedQueUp)?.name || 'Free',
        submissionMessage,
        startTime,
        platform,
        metadata,
        submittedBy: userId,
      };

      const queUpPrice = selectedQueUpObject.price || 0;

      if (queUpPrice > 0) {
        if (
          (paymentConfig as any)?.paypal ||
          (paymentConfig as any)?.customLink
        ) {
          await submitTrax(dataToSend, true);
          setQueUpForPayment(selectedQueUpObject);
          setIsPaymentModalOpen(true);
        } else {
          setMessage({
            text: 'No payment method configured for this host for paid Que-Ups.',
            type: 'error',
          });
        }
      } else {
        await submitTrax(dataToSend, false);
      }
    } catch (error) {
      console.error('Error during submission preparation:', error);
      setMessage({
        text: 'An unexpected error occurred while preparing your submission. Please try again.',
        type: 'error',
      });
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
    traxPreview,
    isTraxConfirmed,
    isSubmitting,
    selectedQueUp,
    expandedQueUp,
    handleUrlChange,
    handleTraxConfirm,
    handleQueUpSelect,
    handleSubmit,
    isPaymentModalOpen,
    queUpForPayment,
    handleClosePaymentModal,
  };
};
