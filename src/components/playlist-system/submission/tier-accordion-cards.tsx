"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSearchParams } from 'next/navigation';
export interface Tier {
  id: string;
  name: string;
  price: number; // in cents
  icon: string;
  iconType: string;
  description: string;
  features: string[];
}
import { useAuth, SignInButton } from '@clerk/nextjs';
import { useGSAP } from '@gsap/react';
import { useSubmissionForm, Message } from './useSubmissionForm';
import { gsap } from 'gsap';


// --- Styles ---
const animationStyles = `
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

  @keyframes chasingLight {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .expand-glow {
    animation: expandGlow 1.8s ease-out forwards;
  }

  .smooth-accordion-expand {
    animation: smoothAccordionExpand 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    overflow: hidden;
  }

  @keyframes expandGlow {
    0% {
      box-shadow: 0 0 0px rgba(0, 255, 255, 0);
    }
    100% {
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4);
    }
  }

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
`;

const PaymentModal = ({ isOpen, onClose, tier, paymentConfig, submissionId }: {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
  paymentConfig: any;
  submissionId: string | null;
}) => {
  if (!isOpen || !tier || !paymentConfig || !submissionId) return null;

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [{
        description: `StayOnBeat Submission - ${tier.name}`,
        amount: { currency_code: "USD", value: (tier.price / 100).toFixed(2) },
      }],
    });
  };

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then(async (details: any) => {
      // In a real app, you would securely update the submission status on the backend
      console.log('Payment successful:', { submissionId, paypalOrderId: details.id });
      alert('Transaction completed by ' + details.payer.name.given_name);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="payment-modal-container">
        <div className="payment-modal-header">
          <h2 className="text-2xl font-bold text-white glass-etched-text">Complete Submission</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">&times;</button>
        </div>
        <div className="payment-modal-body">
          <div className="payment-modal-tier-info">
            <p className="text-gray-300">You've selected <span className="font-bold text-cyan-400">{tier.name}</span>.</p>
            <p className="text-4xl font-bold text-white font-mono my-2">${(tier.price / 100).toFixed(2)}</p>
          </div>
          <div className="payment-modal-actions">
            {paymentConfig.paypalClientId && (
              <PayPalScriptProvider options={{ clientId: paymentConfig.paypalClientId }}>
                <PayPalButtons style={{ layout: "vertical" }} createOrder={createOrder} onApprove={onApprove} />
              </PayPalScriptProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// Tier data
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

// Icon component
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

interface TierAccordionCardsProps {
  className?: string;
}

export function TierAccordionCards({ className = '' }: TierAccordionCardsProps) {
  const container = useRef<HTMLDivElement>(null);
  
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true); // To handle initial loading

  // --- Hooks for full functionality ---
  const { userId, isSignedIn, isLoaded } = useAuth();

  // Mock payment config. In a real app, this would come from a context or API.
  const paymentConfig = { 
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '' 
  };

  const form = useSubmissionForm({
    userId,
    isSignedIn,
    paymentConfig,
    tierData,
    setMessage,
    onSuccess: () => console.log("Submission successful!"),
  });

  useEffect(() => {
    // Simulate loading any initial data
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  useGSAP(() => {
    if (!container.current) return;
    
    // Animate container entrance
    gsap.fromTo(container.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    // Animate tier cards entrance
    const tierCards = container.current.querySelectorAll('.tier-card-enhanced');
    gsap.fromTo(tierCards,
      { opacity: 0, y: 30, scale: 0.95 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power2.out",
        delay: 0.3
      }
    );
  }, { scope: container });

  // --- Loading and Authentication Gates ---
  if (!isLoaded || isLoading) {
    return (
      <div className="text-center py-12 flex items-center justify-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        <span className="text-cyan-400">Loading Submission Form...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center py-12 space-y-6">
        <p className="text-yellow-400 text-lg">Please sign in to submit a track.</p>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform">
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div ref={container} className={`w-full max-w-2xl mx-auto px-4 ${className} relative`}>
      <style>{animationStyles}</style>
      <form onSubmit={form.handleSubmit} className="space-y-8">
        {/* Track URL Input Card */}
        <div
          className="backdrop-blur-sm rounded-xl border-2 overflow-hidden card-hover-effect"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.4) 0%, rgba(6, 182, 212, 0.4) 50%, rgba(147, 51, 234, 0.4) 100%)',
            borderColor: 'rgba(147, 51, 234, 0.8)',
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="p-6">
            <h4 className="text-lg text-white mb-3 text-center glass-etched-text">
              🎵 SUBMIT YOUR TRACK
            </h4>
            <input
              type="url"
              value={form.url}
              onChange={(e) => form.handleUrlChange(e.target.value)}
              placeholder="https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
              className="w-full p-4 rounded-lg bg-gray-900/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Track Preview */}
          {form.trackPreview && (
            <div className="p-6 bg-gray-900/30 border-t border-gray-700/50">
              <h5 className="text-sm font-semibold text-cyan-400 mb-4 flex items-center">
                <span className="mr-2">👁️</span>
                Track Preview
              </h5>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={form.trackPreview.thumbnail} alt="Album Art" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="flex-1">
                  <h6 className="font-semibold text-white text-lg">{form.trackPreview.title}</h6>
                  <p className="text-sm text-gray-400 font-medium">{form.trackPreview.artist}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">{form.trackPreview.duration}</span>
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded">{form.trackPreview.platform}</span>
                  </div>
                </div>
              </div>

              {!form.isTrackConfirmed ? (
                <button type="button" onClick={form.handleTrackConfirm} className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]">
                  ✓ Confirm This Track
                </button>
              ) : (
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

        {/* Tier Selection Container */}
        <div className="bg-gradient-to-r from-purple-900/20 via-cyan-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-purple-400/30 p-6 card-hover-effect">
          <h3 className="text-xl font-bold text-center mb-6 glass-etched-text">
            🎯 SELECT YOUR TIER
          </h3>
          
          <div className="space-y-4">
            {tierData.map((tier) => (
              <div
                key={tier.id}
                className={`tier-card-enhanced bg-gradient-to-r from-cyan-900/40 via-purple-900/40 to-cyan-900/40 backdrop-blur-sm rounded-xl border ${
                  form.selectedTier === tier.id ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 expand-glow' : 'border-cyan-400/80 hover:border-cyan-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => form.handleTierSelect(tier.id)}
                  className="w-full p-6 text-left focus:outline-none"
                >
                  <div className="flex items-center">
                    <div className="w-16 flex justify-center">
                      <ModernTierIcon icon={tier.icon} iconType={tier.iconType} />
                    </div>
                    <div className="flex-1 text-center px-4">
                      <h4 className="glass-etched-text">{tier.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                    </div>
                    <div className="w-20 flex justify-center">
                      <span className="text-lg font-bold text-cyan-400 font-mono">
                        {tier.id === 'random-reset' ? '05:00' : tier.price === 0 ? 'FREE' : `$${Math.floor(tier.price / 100)}`}
                      </span>
                    </div>
                  </div>
                </button>
                {form.expandedTier === tier.id && (
                <div className="px-6 pb-6 border-t border-gray-700/50 smooth-accordion-expand">
                  <div className="pt-4 space-y-4">
                    {/* Features List */}
                    <div className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-300">
                          <span className="text-cyan-400 mr-2">•</span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message for DJ (Optional)
                      </label>
                      <textarea
                        value={form.submissionMessage}
                        onChange={(e) => form.setSubmissionMessage(e.target.value)}
                        placeholder="Any special requests or notes for the DJ?"
                        className="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 h-20 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!form.isTrackConfirmed || form.isSubmitting}
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
                      {form.isSubmitting ? (
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
              )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`text-center p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 text-green-400 border border-green-500/30'
              : message.type === 'error'
              ? 'bg-red-900/20 text-red-400 border border-red-500/30'
              : 'bg-blue-900/20 text-blue-400 border border-blue-500/30'
          }`}>
            {message.text}
          </div>
        )}
      </form>
      <PaymentModal
        isOpen={form.isPaymentModalOpen}
        onClose={form.handleClosePaymentModal}
        tier={form.tierForPayment}
        paymentConfig={paymentConfig}
        submissionId={form.submissionForPaymentId}
      />
    </div>
  );
}
