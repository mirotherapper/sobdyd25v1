"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons, OnApproveData, CreateOrderActions } from "@paypal/react-paypal-js";
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
// Note: Custom animations like 'chasingLight', 'expandGlow', and 'smoothAccordionExpand' 
// may require custom Tailwind configuration for full replication. Below, Tailwind's built-in 
// utilities are used for similar effects where possible.

const PaymentModal = ({ isOpen, onClose, tier, paymentConfig, submissionId }: {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
  paymentConfig: { paypalClientId: string };
  submissionId: string | null;
}) => {
  if (!isOpen || !tier || !paymentConfig || !submissionId) return null;

  const createOrder = useCallback((data: Record<string, unknown>, actions: CreateOrderActions): Promise<string> => {
    return actions.order.create({
      purchase_units: [{
        description: `StayOnBeat Submission - ${tier.name}`,
        amount: { currency_code: "USD", value: (tier.price / 100).toFixed(2) },
      }],
    });
  }, [tier]);

  const onApprove = useCallback((data: OnApproveData, actions: any): Promise<void> => {
    if (!actions.order) {
      return Promise.reject(new Error("PayPal actions.order is undefined."));
    }
    return actions.order.capture().then(async (details: { id: string; payer: { name?: { given_name?: string } } }) => {
      // --- SECURITY IMPROVEMENT ---
      // The client must call the backend to securely verify and record the payment.
      try {
        const response = await fetch('/api/submissions/update-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: submissionId,
            paypalOrderId: details.id,
          }),
        });

        if (!response.ok) {
          // Handle server-side verification failure
          const errorData = await response.json();
          alert(`Payment verification failed: ${errorData.message || 'Please contact support.'}`);
          // Do not close the modal or reset the form on failure
          return;
        }

        // Server has confirmed the payment. Now we can proceed.
        console.log("Payment successful and verified by server:", { submissionId, paypalOrderId: details.id });
        if (details.payer.name?.given_name) {
          alert(`Transaction completed by ${details.payer.name.given_name}`);
        }
        onClose(); // Close modal and reset form only on success
      } catch (error) {
        console.error("Error verifying payment:", error);
        alert("An error occurred while verifying your payment. Please contact support.");
      }
    });
  }, [submissionId, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white font-mono tracking-wider uppercase">Complete Submission</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors duration-300 text-3xl">&times;</button>
        </div>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300">You've selected <span className="font-bold text-cyan-400">{tier.name}</span>.</p>
            <p className="text-4xl font-bold text-white font-mono my-2">${(tier.price / 100).toFixed(2)}</p>
          </div>
          <div className="flex justify-center">
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
  const baseStyles = "flex items-center justify-center text-cyan-400 font-bold transition-all duration-300 ease-in-out";

  switch (iconType) {
    case 'text':
      return (
        <div className={`${baseStyles} text-sm tracking-wider font-mono bg-cyan-400/10 rounded-md px-2 py-1 border border-cyan-400/30`}>
          {icon}
        </div>
      );
    case 'clock':
      return (
        <div className={`${baseStyles} text-xs font-mono bg-red-400/10 rounded-md px-2 py-1 border border-red-400/30 text-red-400`}>
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
        <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
          Sign In
        </button>
      </SignInButton>
    </div>
  );
  }

  return (
    <div ref={container} className={`w-full max-w-2xl mx-auto px-4 ${className} relative`}>
      {/* Removed <style> tag, using Tailwind CSS classes instead */}
      <form onSubmit={form.handleSubmit} className="space-y-8">
        {/* Track URL Input Card */}
          <div className="backdrop-blur-sm rounded-xl border-2 border-purple-400/80 overflow-hidden relative bg-gradient-to-r from-purple-900/40 to-cyan-900/40 shadow-lg shadow-purple-400/30 transition-all duration-300 ease-in-out group">
            {/* Note: 'card-hover-effect' replaced with Tailwind's 'group' and 'transition-all'. Custom pseudo-element animation may need custom Tailwind config. */}
          <div className="p-6">
            <h4 className="text-lg text-white mb-3 text-center font-mono tracking-wider uppercase text-shadow-lg">
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
                    <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md">{form.trackPreview.duration}</span>
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-md">{form.trackPreview.platform}</span>
                  </div>
                </div>
              </div>

              {!form.isTrackConfirmed ? (
                <button type="button" onClick={form.handleTrackConfirm} className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
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
        <div className="bg-gradient-to-r from-purple-900/20 via-cyan-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-purple-400/30 p-6 card-hover-effect shadow-lg shadow-purple-400/30">
          <h3 className="text-xl font-bold text-center mb-6 font-mono tracking-wider uppercase text-shadow-lg">
            🎯 SELECT YOUR TIER
          </h3>
          
          <div className="space-y-4">
            {tierData.map((tier) => (
              <div
                key={tier.id}
                className={`tier-card-enhanced bg-gradient-to-r from-purple-900/40 via-cyan-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl border ${
                  form.selectedTier === tier.id ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-cyan-400/80 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-400/30'
                } transition-all duration-300 ease-in-out relative overflow-hidden`}
              >
                {/* Note: 'expand-glow' animation replaced with Tailwind's shadow utilities. For full animation effect, consider custom Tailwind animation config. */}
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
                      <h4 className="font-mono tracking-wider uppercase text-white text-shadow-lg">{tier.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{tier.description}</p>
                    </div>
                    <div className="w-20 flex justify-center">
                      <span className="text-lg font-bold text-cyan-400 font-mono">
                        {tier.id === 'random-reset' ? '05:00' : tier.price === 0 ? 'FREE' : `$${Math.floor(tier.price / 100)}`}
                      </span>
                    </div>
                  </div>
                </button>
                {form.expandedTier === tier.id && (
                  <div className="px-6 pb-6 border-t border-gray-700/50 overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] max-h-[800px] opacity-100 translate-y-0">
                    {/* Note: 'smooth-accordion-expand' animation approximated with Tailwind's transition utilities. Full effect may require custom animation in Tailwind config. */}
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
                        className={`w-full py-3 px-6 rounded-lg text-white transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                          tier.price > 0 ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gradient-to-r from-green-600 to-cyan-500'
                        } shadow-lg shadow-cyan-400/30 font-mono tracking-wider uppercase font-bold`}
                      >
                        {form.isSubmitting ? (
                          <>
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          "SUBMIT"
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
