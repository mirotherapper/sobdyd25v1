"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { detectPlatform, extractMetadata } from '../../../../lib/url-utils';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

// --- Type Definitions (previously in hook) ---
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
  price: number; // in cents
  icon: string;
  iconType: string;
  description: string;
  features: string[];
}
export type MessageType = 'success' | 'error' | 'info';
export interface Message {
  text: string;
  type: MessageType;
}
// Advanced Animation Styles
const animationStyles = `
  @keyframes smoothAccordionExpand {
    from {
      max-height: 0;
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      max-height: 800px;
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes chasingLight {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes glassShimmer {
    0% {
      transform: translateX(-100%) skewX(-15deg);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%) skewX(-15deg);
      opacity: 0;
    }
  }

  @keyframes continuousShimmer {
    0% {
      transform: translateX(var(--shimmer-start, -100%)) skewX(-15deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%) skewX(-15deg);
      opacity: 0;
    }
  }

  @keyframes expandGlow {
    0% {
      box-shadow: 0 0 0px rgba(0, 255, 255, 0);
    }
    100% {
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4);
    }
  }

  .smooth-accordion-expand {
    animation: smoothAccordionExpand 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    overflow: hidden;
  }

  .card-hover-effect {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.3), inset 0 0 1px rgba(139, 92, 246, 0.2);
  }

  .card-hover-effect:hover {
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.4), 0 0 25px rgba(0, 255, 255, 0.2), inset 0 0 2px rgba(139, 92, 246, 0.4);
  }

  .card-hover-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
    z-index: 1;
  }

  .card-hover-effect:hover::before {
    animation: chasingLight 1.5s ease-in-out forwards;
  }

  .expand-glow {
    animation: expandGlow 1.8s ease-out forwards;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4);
  }

  .tier-card-enhanced {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.3), inset 0 0 1px rgba(0, 255, 255, 0.2);
  }

  .tier-card-enhanced:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3), 0 0 25px rgba(139, 92, 246, 0.2), inset 0 0 2px rgba(0, 255, 255, 0.4);
  }

  .glass-etched-text {
    font-family: 'Orbitron', 'Exo 2', 'Rajdhani', 'Russo One', monospace;
    font-weight: 700;
    font-size: 1.25rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.95);
    text-shadow:
      0 0 8px rgba(0, 255, 255, 0.6),
      0 0 16px rgba(0, 255, 255, 0.4),
      0 0 24px rgba(0, 255, 255, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.5);
    filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.3));
  }

  .payment-modal-container {
    background: radial-gradient(circle, rgba(20, 25, 40, 0.95) 0%, rgba(15, 20, 30, 0.98) 100%);
    border-radius: 1rem;
    padding: 2rem;
    max-width: 28rem;
    width: 100%;
    border: 1px solid rgba(0, 255, 255, 0.2);
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 255, 0.1);
    transform: scale(0.95);
    opacity: 0;
    animation: fadeInZoom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  @keyframes fadeInZoom {
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .payment-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  .payment-modal-header button {
    font-size: 2rem;
    line-height: 1;
  }

  .payment-modal-body {
    text-align: center;
  }
  
  .payment-modal-tier-info {
    margin-bottom: 2rem;
  }

  .payment-modal-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .payment-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease-in-out;
    transform: perspective(1000px);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
  }

  .payment-button:hover {
    transform: scale(1.03) translateZ(20px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  .paypal-button { background-color: #ffc439; color: #003087; border-color: #ffc439; }
  .paypal-button:hover { background-color: #fdbd22; }
  .custom-link-button { background-color: #8b5cf6; color: white; border-color: #8b5cf6; }
  .custom-link-button:hover { background-color: #7c3aed; }

  .payment-modal-footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(0, 255, 255, 0.1); text-align: center; }


`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = animationStyles;
  document.head.appendChild(styleSheet);
}

// Modern Icon Component
const ModernTierIcon = ({ icon, iconType }: { icon: string; iconType: string }) => {
  const baseStyles = "flex items-center justify-center text-cyan-400 font-bold transition-all duration-300";

  switch (iconType) {
    case 'text':
      return (
        <div className={`${baseStyles} text-sm tracking-wider font-mono bg-cyan-400/10 rounded px-2 py-1 border border-cyan-400/30`}>
          {icon}
        </div>
      );
    case 'clock':
      return (
        <div className={`${baseStyles} text-xs font-mono bg-red-400/10 rounded px-2 py-1 border border-red-400/30 text-red-400`}>
          {icon}
        </div>
      );
    case 'emoji':
    default:
      return (
        <div className={`${baseStyles} text-xl`}>
          {icon}
        </div>
      );
  }
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
  paymentConfig: any;
  submissionId: string | null;
}

const PayPalIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.963 2.553c-.313.086-.6.268-.82.513-.756.845-1.35 2.523-1.583 4.23l-.06.423H3.5c-.43 0-.78.35-.78.78v1.208c0 .43.35.78.78.78h1.85c.06.424.14.83.24 1.22l.118.45c.12.45.26.88.42 1.29.37 1.01.93 1.78 1.68 2.32.75.54 1.65.81 2.69.81h.01c.06 0 .12-.01.18-.02.4-.05.76-.18 1.05-.38.3-.2.54-.48.71-.82l.08-.15c.33-.6.46-1.35.38-2.25-.08-.9-.38-1.8-1.03-2.9-.2-.33-.4-.65-.6-.95-.2-.3-.4-.6-.6-.9-.58-.88-1-1.6-1.2-2.15-.2-.55-.2-1-.02-1.25.18-.25.5-.4 1-.4h.75c.33 0 .64.13.88.38.24.25.38.58.42.95l.08.45.06.45.02.15h2.1c.43 0 .78-.35.78-.78V9.75c0-.43-.35-.78-.78-.78h-2.2c-.04-.3-.08-.6-.12-.9-.16-.98-.5-1.96-1.03-2.93-.53-.98-1.2-1.76-2.03-2.35-.83-.59-1.8-.88-2.9-.88h-.1z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const PaymentModal = ({ isOpen, onClose, tier, paymentConfig, submissionId }: PaymentModalProps) => {
  if (!isOpen || !tier || !paymentConfig || !submissionId) return null;

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          description: `StayOnBeat Submission - ${tier.name}`,
          amount: {
            currency_code: "USD",
            value: (tier.price / 100).toFixed(2),
          },
        },
      ],
    });
  };

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then(async (details: any) => {
      // Securely update the submission status on the backend
      await fetch('/api/submissions/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submissionId,
          paypalOrderId: details.id,
          payer: details.payer,
        }),
      });
      alert('Transaction completed by ' + details.payer.name.given_name); // Placeholder success message
      onClose(); // Close modal on success
    });
  };

  const onError = (err: any) => {
    console.error("PayPal Checkout onError", err);
    alert("An error occurred with your payment. Please try again."); // Placeholder error message
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="payment-modal-container">
        <div className="payment-modal-header">
          <h2 className="text-2xl font-bold text-white glass-etched-text">Complete Your Submission</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-4xl leading-none">&times;</button>
        </div>
        
        <div className="payment-modal-body">
          <div className="payment-modal-tier-info">
            <p className="text-gray-300">You've selected the <span className="font-bold text-cyan-400">{tier.name}</span> tier.</p>
            <p className="text-4xl font-bold text-white font-mono my-2">${(tier.price / 100).toFixed(2)}</p>
            <p className="text-xs text-gray-400">Your submission is saved. Payment will finalize its priority.</p>
          </div>

          <div className="payment-modal-actions">
            {paymentConfig.paypalClientId && (
              <PayPalButtons
                style={{ layout: "vertical", label: "pay", tagline: false }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
              />
            )}
            {paymentConfig.customLink && (
              <a href={paymentConfig.customLink} target="_blank" rel="noopener noreferrer" className="payment-button custom-link-button">
                <LinkIcon />
                Use Custom Payment Link
              </a>
            )}
          </div>
        </div>

        <div className="payment-modal-footer">
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">What's Next?</h4>
          <p className="text-xs text-gray-400">
            After payment, your track will be marked as <span className="font-semibold text-white">{tier.name}</span> in the DJ's queue, ensuring it gets the priority you've selected.
          </p>
        </div>
      </div>
    </div>
  );
};

const SubmissionFormSkeleton = () => (
  <div className="w-full max-w-2xl mx-auto animate-pulse" data-testid="submission-form-skeleton">
    {/* Header Skeleton */}
    <div className="mb-8 text-center">
      <div className="h-10 bg-gray-700 rounded-md w-3/4 mx-auto mb-3"></div>
      <div className="h-4 bg-gray-700 rounded-md w-1/2 mx-auto"></div>
    </div>

    <div className="space-y-6">
      {/* URL Card Skeleton */}
      <div className="bg-gray-800/50 rounded-xl p-6 border-2 border-purple-400/20">
        <div className="h-6 bg-gray-700 rounded-md w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-700 rounded-lg w-full"></div>
      </div>

      {/* Tier Cards Skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-6 h-24 border border-cyan-400/20 flex items-center justify-between">
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
            <div className="h-6 bg-gray-700 rounded-md w-1/2"></div>
            <div className="h-8 bg-gray-700 rounded-md w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);


const tierPrices: { [key: string]: number } = {
  'Free': 0,
  'GA': 1000, // $10.00 in cents
  'Skip': 2500, // $25.00 in cents
  'VIP': 5000, // $50.00 in cents
  'Random Reset': 0,
};

const tierData = [
  {
    id: 'vip',
    name: 'VIP PRIORITY',
    price: 5000,
    icon: 'VIP',
    iconType: 'text',
    description: 'Highest priority with special treatment',
    features: ['Top priority placement', 'Instant processing', 'VIP treatment', 'Special recognition']
  },
  {
    id: 'skip',
    name: 'SKIP THE LINE',
    price: 2500,
    icon: '⚡',
    iconType: 'emoji',
    description: 'Skip the Line - Jump ahead',
    features: ['Skip to front of queue', 'Immediate processing', 'Premium placement']
  },
  {
    id: 'ga',
    name: 'GUARANTEED PLAY',
    price: 1000,
    icon: 'GA',
    iconType: 'text',
    description: 'Guaranteed Play - Your track will be played',
    features: ['Guaranteed to be played', 'Priority queue placement', 'Enhanced visibility']
  },
  {
    id: 'free',
    name: 'FREE CHANCE',
    price: 0,
    icon: '🎲',
    iconType: 'emoji',
    description: 'By chance only - Standard queue submission',
    features: ['Added to general queue', 'Standard processing time', 'Basic submission']
  },
  {
    id: 'random-reset',
    name: 'RANDOM RESET',
    price: 0,
    icon: '05:00',
    iconType: 'clock',
    description: 'Special end-of-show feature',
    features: ['Special end-of-show feature', 'Random playlist reset', 'Unique experience']
  }
];

interface TierAccordionCardsProps {
  className?: string;
}

export function TierAccordionCards({ className = '' }: TierAccordionCardsProps) {
  const container = useRef<HTMLDivElement>(null);
  const tierRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const shimmerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const accordionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const prevExpandedTier = useRef<string | null>(null);

  // --- State and Logic consolidated from useSubmissionForm ---
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
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
  const [submissionForPaymentId, setSubmissionForPaymentId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const hostId = searchParams.get('hostId');
  const { userId, isLoaded, isSignedIn } = useAuth();

  const { contextSafe } = useGSAP({ scope: container });

  const animateCardHover = contextSafe((cardId: string, isHovering: boolean) => {
    const card = tierRefs.current[cardId];
    if (!card) return;

    gsap.to(card, {
      y: isHovering ? -2 : 0,
      scale: isHovering ? 1.01 : 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  });

  const animateShimmer = contextSafe((cardId: string) => {
    const shimmerEl = shimmerRefs.current[cardId];
    if (!shimmerEl) return;

    gsap.fromTo(
      shimmerEl,
      { xPercent: -120, opacity: 0, skewX: -15 },
      {
        xPercent: 120,
        opacity: 1,
        duration: 0.8,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.2,
      }
    );
  });

  const animateAccordionExpand = contextSafe((tierId: string, isExpanding: boolean) => {
    const content = accordionRefs.current[tierId];
    if (!content) return;

    gsap.to(content, {
      height: isExpanding ? 'auto' : 0,
      opacity: isExpanding ? 1 : 0,
      paddingTop: isExpanding ? '1rem' : 0,
      paddingBottom: isExpanding ? '1.5rem' : 0,
      duration: 0.5,
      ease: 'power3.inOut',
    });
  });

  // --- Functions consolidated from useSubmissionForm ---

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
    setMessage({ text: "Your submission is in the queue. You can submit another track.", type: 'info' });
    resetForm();
  };

  const submitTrack = async (data: any, isPaid: boolean): Promise<string | null> => {
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
        return null;
      }

      if (response.ok) {
        if (isPaid) {
          setMessage({ text: 'Submission recorded! Please complete payment.', type: 'success' });
        } else {
          setMessage({ text: 'Submission successful! Your track is in the queue.', type: 'success' });
          resetForm();
        }
        // Assuming the backend returns the ID of the new submission
        return result.submissionId;
      } else {
        const errorMessage = result?.error || 'An unknown error occurred.';
        setMessage({ text: `Submission failed: ${errorMessage}`, type: 'error' });
        return null;
      }
    } catch (error: any) {
      console.error("Submission network error:", error);
      setMessage({ text: 'A network error occurred. Please check your connection and try again.', type: 'error' });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        submissionType: selectedTierObject.name,
        submissionMessage,
        startTime,
        platform,
        metadata,
        submittedBy: userId,
      };

      const tierPrice = selectedTierObject.price || 0;

      if (tierPrice > 0) {
        if (paymentConfig?.paypalClientId || paymentConfig?.customLink) {
          const submissionId = await submitTrack(dataToSend, true);
          if (submissionId) {
            setSubmissionForPaymentId(submissionId);
            setTierForPayment(selectedTierObject as Tier);
            setIsPaymentModalOpen(true);
          }
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

  useEffect(() => {
    if (hostId) {
      setIsLoading(true);
      fetch(`/api/host-payment-config?hostId=${hostId}`)
        .then(res => res.json())
        .then(data => {
          setPaymentConfig(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching host payment config:', error);
          setMessage({ text: 'Error loading payment configuration.', type: 'error' });
          setIsLoading(false);
        });
    } else {
      setMessage('Host ID is missing. Cannot load payment configuration.');
    }
  }, [hostId]);

  useEffect(() => {
    if (prevExpandedTier.current && prevExpandedTier.current !== expandedTier) {
      animateAccordionExpand(prevExpandedTier.current, false);
    }
    if (expandedTier && expandedTier !== prevExpandedTier.current) {
      animateAccordionExpand(expandedTier, true);
    }
    prevExpandedTier.current = expandedTier;
  }, [expandedTier, animateAccordionExpand]);

  const handleShimmerEnter = (cardId: string) => {
    animateShimmer(cardId);
    animateCardHover(cardId, true);
  };

  if (!hostId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Host ID is missing. Cannot load submission form.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
        <span className="ml-3 text-cyan-400">Loading...</span>
      </div>
    );
  }

  if (isLoading) {
    return <SubmissionFormSkeleton />;
  }

  /* Temporarily disabled authentication for testing
  if (!isSignedIn) {
    return (
      <div className="text-center py-12">
        <p className="text-yellow-400">Please sign in to submit a track.</p>
      </div>
    );
  }
  */

  return (
    <div ref={container} className={`w-full max-w-2xl mx-auto ${className} relative`}>
      {/* Conditionally render the provider and modal to ensure client ID is available */}
      {isPaymentModalOpen && paymentConfig?.paypalClientId && (
        <PayPalScriptProvider options={{ "client-id": paymentConfig.paypalClientId, currency: "USD" }}>
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={handleClosePaymentModal}
            tier={tierForPayment}
            paymentConfig={paymentConfig}
            submissionId={submissionForPaymentId}
          />
        </PayPalScriptProvider>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Submit Your Track
        </h1>
        <p className="text-center text-gray-300">Choose your submission tier and get your music heard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Track URL Card - Matches Banner Design */}
        <div
          className="bg-gradient-to-r from-purple-900/40 via-cyan-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl border-2 border-purple-400/80 hover:border-purple-300 overflow-hidden card-hover-effect"
        >
          {/* Shimmer overlay for GSAP */}
          <div
            ref={(el) => (shimmerRefs.current['url-card'] = el)}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-0 pointer-events-none"
            style={{ transform: 'translateX(-120%) skewX(-15deg)' }}
          />
          {/* Card Header */}
          <div className="p-6 border-b border-gray-700/50">
            <h4 className="text-lg text-white mb-3 text-center glass-etched-text">
              🎵 SUBMIT YOUR TRACK
            </h4>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-3">
              Track URL * (Main Entry Point)
            </label>
            <input
              type="url"
              id="url"
              className="w-full p-4 rounded-lg bg-gray-900/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
              required
            />
          </div>

          {/* Track Preview - Folds Out */}
          {trackPreview && (
            <div className="p-6 bg-gray-900/30 border-t border-gray-700/50 smooth-accordion-expand">
              <h5 className="text-sm font-semibold text-cyan-400 mb-4 flex items-center">
                <span className="mr-2">👁️</span>
                Track Preview
              </h5>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {trackPreview.thumbnail ? (
                    <img
                      src={trackPreview.thumbnail}
                      alt="Album Art"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl">🎵</span>
                  )}
                </div>
                <div className="flex-1">
                  <h6 className="font-semibold text-white text-lg">{trackPreview.title}</h6>
                  <p className="text-sm text-gray-400 font-medium">{trackPreview.artist}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                      {trackPreview.duration}
                    </span>
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                      {trackPreview.platform}
                    </span>
                  </div>
                </div>
              </div>

              {!isTrackConfirmed && (
                <button
                  type="button"
                  onClick={handleTrackConfirm}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  ✓ Confirm This Track
                </button>
              )}

              {isTrackConfirmed && (
                <div className="text-center p-4 bg-green-900/20 text-green-400 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">✓</span>
                    <span className="font-medium">Track Confirmed! Select your submission tier below.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tier Selection Accordion */}
        {url && (
          <div className="space-y-3">
            {tierData.map((tier) => (
            <div
              key={tier.id}
              ref={(el) => (tierRefs.current[`tier-${tier.id}`] = el)}
              className={`tier-card-enhanced bg-gradient-to-r from-cyan-900/40 via-purple-900/40 to-cyan-900/40 backdrop-blur-sm rounded-xl border ${ selectedTier === tier.id ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 expand-glow' : 'border-cyan-400/80 hover:border-cyan-300' }`}
              onMouseEnter={() => handleShimmerEnter(tier.id)}
              onMouseLeave={() => animateCardHover(tier.id, false)}
            >
              {/* Shimmer overlay for GSAP */}
              <div
                ref={(el) => (shimmerRefs.current[`tier-${tier.id}`] = el)}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 pointer-events-none"
                style={{ transform: 'translateX(-120%) skewX(-15deg)' }}
              />
              <button
                type="button"
                onClick={() => handleTierSelect(tier.id)}
                className="w-full p-6 text-left focus:outline-none"
              >
                <div className="flex items-center">
                  <div className="w-16 flex justify-center">
                    <ModernTierIcon icon={tier.icon} iconType={tier.iconType} />
                  </div>
                  <div className="flex-1 text-center px-4">
                    <h4 className="glass-etched-text">
                      {tier.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                  </div>
                  <div className="w-20 flex justify-center">
                    <span className="text-lg font-bold text-cyan-400 font-mono">
                      {tier.id === 'random-reset' ? '05:00' :
                       tier.price === 0 ? 'FREE' :
                       `$${Math.floor(tier.price / 100)}`}
                    </span>
                  </div>
                </div>
              </button>
              
              {expandedTier === tier.id && (
                <div
                  ref={(el) => (accordionRefs.current[tier.id] = el)}
                  className="px-6 pb-6 border-t border-gray-700/50 smooth-accordion-expand"
                >
                  <div className="pt-4 space-y-4">

                              >
                                Pay with PayPal - ${(tier.price / 100).toFixed(2)}
                              </button>
                            )}
                            {paymentConfig.customLink && (
                              <a
                                href={paymentConfig.customLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full block text-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                              >
                                Custom Payment Link - ${(tier.price / 100).toFixed(2)}
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Message for DJ (Optional)
                        </label>
                        <textarea
                          value={submissionMessage}
                          onChange={(e) => setSubmissionMessage(e.target.value)}
                          placeholder="Any special requests or notes for the DJ?"
                          className="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 h-20 resize-none"
                        />
                      </div>

                      {/* Start Time Field - Right Aligned */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-400">
                          Start Time:
                        </label>
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9:]/g, '');
                            if (value.length <= 5) setStartTime(value);
                          }}
                          placeholder="00:00"
                          maxLength={5}
                          className="w-16 p-1 text-center text-sm rounded bg-gray-900/70 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-gray-500"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmit}
                        disabled={!isTrackConfirmed || isSubmitting}
                        className="w-full py-3 px-6 rounded-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: tier.price > 0
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                            : 'linear-gradient(135deg, #059669 0%, #06b6d4 100%)',
                          boxShadow: '0 4px 15px rgba(0, 255, 255, 0.3)',
                          fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', 'Russo One', monospace",
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          'SUBMIT'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`text-center p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 text-green-400 border border-green-500/30' 
              : message.type === 'error'
              ? 'bg-red-900/20 text-red-400 border border-red-500/30'
              : 'bg-blue-900/20 text-blue-400 border border-blue-500/30' // Info
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
