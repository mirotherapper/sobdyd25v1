'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// Define types locally since they're not properly exported
interface CreateOrderData {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: any[];
}

interface CreateOrderActions {
  order: {
    create: (data: CreateOrderData) => Promise<string>;
  };
}

interface OnApproveData {
  orderID: string;
  payerID?: string | null;
}

interface OnApproveActions {
  order: {
    capture: () => Promise<any>;
  };
}
export interface QueUp {
  id: string;
  name: string;
  price: number; // in cents
  icon: string;
  iconType: string;
  description: string;
  features: string[];
}
import { useAuth, SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { useSubmissionForm, Message } from './useSubmissionForm';
import { gsap } from 'gsap';

// --- Styles ---
// Note: Custom animations like 'chasingLight', 'expandGlow', and 'smoothAccordionExpand'
// may require custom Tailwind configuration for full replication. Below, Tailwind's built-in
// utilities are used for similar effects where possible.

const PaymentModal = ({
  isOpen,
  onClose,
  queUp,
  paymentConfig,
  submissionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  queUp: QueUp | null;
  paymentConfig: { paypalClientId: string };
  submissionId: string | null;
}) => {
  if (!isOpen || !queUp || !paymentConfig || !submissionId) return null;

  const createOrder = useCallback(
    (data: any, actions: any): Promise<string> => {
      return actions.order.create({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: `DoYouDj Submission - ${queUp.name}`,
            amount: {
              currency_code: 'USD',
              value: (queUp.price / 100).toFixed(2),
            },
          },
        ],
      });
    },
    [queUp]
  );

  const onApprove = useCallback(
    (data: any, actions: any): Promise<void> => {
      if (!actions.order) {
        return Promise.reject(new Error('PayPal actions.order is undefined.'));
      }
      return actions.order
        .capture()
        .then(
          async (details: {
            id: string;
            payer: { name?: { given_name?: string } };
          }) => {
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
                alert(
                  `Payment verification failed: ${errorData.message || 'Please contact support.'}`
                );
                // Do not close the modal or reset the form on failure
                return;
              }

              // Server has confirmed the payment. Now we can proceed.
              console.log('Payment successful and verified by server:', {
                submissionId,
                paypalOrderId: details.id,
              });
              if (details.payer.name?.given_name) {
                alert(
                  `Transaction completed by ${details.payer.name.given_name}`
                );
              }
              onClose(); // Close modal and reset form only on success
            } catch (error) {
              console.error('Error verifying payment:', error);
              alert(
                'An error occurred while verifying your payment. Please contact support.'
              );
            }
          }
        );
    },
    [submissionId, onClose]
  );

  return (
    <div className="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-2xl font-bold tracking-wider text-white uppercase">
            Complete Submission
          </h2>
          <button
            onClick={onClose}
            className="text-3xl text-gray-500 transition-colors duration-300 hover:text-white"
          >
            &times;
          </button>
        </div>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300">
              You&apos;ve selected{' '}
              <span className="font-bold text-cyan-400">{queUp.name}</span>.
            </p>
            <p className="my-2 font-mono text-4xl font-bold text-white">
              ${(queUp.price / 100).toFixed(2)}
            </p>
          </div>
          <div className="flex justify-center">
            {paymentConfig.paypalClientId && (
              <PayPalScriptProvider
                options={{ clientId: paymentConfig.paypalClientId }}
              >
                <PayPalButtons
                  style={{ layout: 'vertical' }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                />
              </PayPalScriptProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Que-Up data
const queUpData = [
  {
    id: 'vip',
    name: 'VIP PRIORITY',
    price: 5000,
    icon: 'VIP',
    iconType: 'text',
    description: 'Highest priority with special treatment',
    features: [
      'Top priority placement',
      'Instant processing',
      'VIP treatment',
      'Special recognition',
    ],
  },
  {
    id: 'skip',
    name: 'SKIP THE LINE',
    price: 2500,
    icon: '⚡',
    iconType: 'emoji',
    description: 'Skip the Line - Jump ahead',
    features: [
      'Skip to front of queue',
      'Immediate processing',
      'Premium placement',
    ],
  },
  {
    id: 'ga',
    name: 'GUARANTEED PLAY',
    price: 1000,
    icon: 'GA',
    iconType: 'text',
    description: 'Guaranteed Play - Your trax will be played',
    features: [
      'Guaranteed to be played',
      'Priority queue placement',
      'Enhanced visibility',
    ],
  },
  {
    id: 'free',
    name: 'FREE CHANCE',
    price: 0,
    icon: '🎲',
    iconType: 'emoji',
    description: 'By chance only - Standard queue submission',
    features: [
      'Added to general queue',
      'Standard processing time',
      'Basic submission',
    ],
  },
  {
    id: 'random-reset',
    name: 'RANDOM RESET',
    price: 0,
    icon: '05:00',
    iconType: 'clock',
    description: 'Special end-of-show feature',
    features: [
      'Special end-of-show feature',
      'Random playlist reset',
      'Unique experience',
    ],
  },
];

// Icon component
const ModernQueUpIcon = ({
  icon,
  iconType,
}: {
  icon: string;
  iconType: string;
}) => {
  const baseStyles =
    'flex items-center justify-center text-cyan-400 font-bold transition-all duration-300 ease-in-out';

  switch (iconType) {
    case 'text':
      return (
        <div
          className={`${baseStyles} rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 font-mono text-sm tracking-wider`}
        >
          {icon}
        </div>
      );
    case 'clock':
      return (
        <div
          className={`${baseStyles} rounded-md border border-red-400/30 bg-red-400/10 px-2 py-1 font-mono text-xs text-red-400`}
        >
          {icon}
        </div>
      );
    case 'emoji':
    default:
      return <div className={`${baseStyles} text-xl`}>{icon}</div>;
  }
};

interface QueUpFormProps {
  className?: string;
}

export function QueUpForm({ className = '' }: QueUpFormProps) {
  const container = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true); // To handle initial loading

  // --- Hooks for full functionality ---
  const { userId, isSignedIn, isLoaded } = useAuth();

  // Mock payment config. In a real app, this would come from a context or API.
  const paymentConfig = {
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  };

  const form = useSubmissionForm({
    userId,
    paymentConfig,
    queUpData,
    setMessage,
    onSuccess: () => console.log('Submission successful!'),
  });

  useEffect(() => {
    // Simulate loading any initial data
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  useGSAP(
    () => {
      if (!container.current) return;

      // Animate container entrance
      gsap.fromTo(
        container.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );

      // Animate que-up cards entrance
      const queUpCards = container.current.querySelectorAll(
        '.queup-card-enhanced'
      );
      gsap.fromTo(
        queUpCards,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    },
    { scope: container }
  );

  // --- Loading and Authentication Gates ---
  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center space-x-3 py-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400"></div>
        <span className="text-cyan-400">Loading Submission Form...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="space-y-6 py-12 text-center">
        <p className="text-lg text-yellow-400">
          Please sign in to submit a trax.
        </p>
        <SignInButton mode="modal">
          <button className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-bold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div
      ref={container}
      className={`mx-auto w-full max-w-2xl px-4 ${className} relative`}
    >
      {/* Removed <style> tag, using Tailwind CSS classes instead */}
      <form onSubmit={form.handleSubmit} className="space-y-8">
        {/* Trax URL Input Card */}
        <div className="group relative overflow-hidden rounded-xl border-2 border-purple-400/80 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 shadow-lg shadow-purple-400/30 backdrop-blur-sm transition-all duration-300 ease-in-out">
          {/* Note: 'card-hover-effect' replaced with Tailwind's 'group' and 'transition-all'. Custom pseudo-element animation may need custom Tailwind config. */}
          <div className="p-6">
            <h4 className="mb-3 text-center font-mono text-lg tracking-wider text-white uppercase text-shadow-lg">
              🎵 SUBMIT YOUR TRAX
            </h4>
            <input
              type="url"
              value={form.url}
              onChange={e => form.handleUrlChange(e.target.value)}
              placeholder="https://open.spotify.com/trax/... or https://youtube.com/watch?v=..."
              className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-4 text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              required
            />
          </div>

          {/* Trax Preview */}
          {form.traxPreview && (
            <div className="border-t border-gray-700/50 bg-gray-900/30 p-6">
              <h5 className="mb-4 flex items-center text-sm font-semibold text-cyan-400">
                <span className="mr-2">👁️</span>
                Trax Preview
              </h5>
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-700">
                  <Image
                    src={form.traxPreview.thumbnail}
                    alt="Album Art"
                    width={64}
                    height={64}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h6 className="text-lg font-semibold text-white">
                    {form.traxPreview.title}
                  </h6>
                  <p className="text-sm font-medium text-gray-400">
                    {form.traxPreview.artist}
                  </p>
                  <div className="mt-1 flex items-center space-x-3">
                    <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs text-cyan-400">
                      {form.traxPreview.duration}
                    </span>
                    <span className="rounded-md bg-purple-400/10 px-2 py-1 text-xs text-purple-400">
                      {form.traxPreview.platform}
                    </span>
                  </div>
                </div>
              </div>

              {!form.isTraxConfirmed ? (
                <button
                  type="button"
                  onClick={form.handleTraxConfirm}
                  className="w-full transform rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:scale-[1.02] hover:from-green-700 hover:to-emerald-700"
                >
                  ✓ Confirm This Trax
                </button>
              ) : (
                <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-4 text-center text-green-400">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">✓</span>
                    <span className="font-medium">
                      Trax Confirmed! Select your submission Que-Up below.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Que-Up Selection Container */}
        <div className="card-hover-effect rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-900/20 via-cyan-900/20 to-purple-900/20 p-6 shadow-lg shadow-purple-400/30 backdrop-blur-sm">
          <h3 className="mb-6 text-center font-mono text-xl font-bold tracking-wider uppercase text-shadow-lg">
            🎯 SELECT YOUR QUE-UP
          </h3>

          <div className="space-y-4">
            {queUpData.map(queUp => (
              <div
                key={queUp.id}
                className={`queup-card-enhanced group relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-xl transition-all duration-500 ease-out ${
                  form.selectedQueUp === queUp.id
                    ? 'border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.3)] ring-2 ring-cyan-400/50'
                    : 'border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)]'
                } border shadow-[0_0_15px_rgba(0,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]`}
                style={{
                  boxShadow:
                    form.selectedQueUp === queUp.id
                      ? '0 0 30px rgba(0, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : '0 0 15px rgba(0, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Cyberpunk grid overlay for glassmorphic texture */}
                <div className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px',
                    }}
                  />
                </div>

                {/* Glow effect on hover following glassmorphism rules */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                {/* Glowing border effect when selected */}
                {form.selectedQueUp === queUp.id && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.2) 50%, transparent 70%)`,
                      padding: '1px',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => form.handleQueUpSelect(queUp.id)}
                  className="relative z-10 w-full rounded-xl p-6 text-left focus:ring-2 focus:ring-cyan-400/50 focus:outline-none"
                >
                  <div className="flex items-center">
                    <div className="flex w-16 justify-center">
                      <ModernQueUpIcon
                        icon={queUp.icon}
                        iconType={queUp.iconType}
                      />
                    </div>
                    <div className="flex-1 px-4 text-center">
                      <h4 className="font-mono tracking-wider text-white uppercase text-shadow-lg">
                        {queUp.name}
                      </h4>
                      <p className="mt-1 text-xs text-gray-400">
                        {queUp.description}
                      </p>
                    </div>
                    <div className="flex w-20 justify-center">
                      <span className="font-mono text-lg font-bold text-cyan-400">
                        {queUp.id === 'random-reset'
                          ? '05:00'
                          : queUp.price === 0
                            ? 'FREE'
                            : `$${Math.floor(queUp.price / 100)}`}
                      </span>
                    </div>
                  </div>
                </button>
                {form.expandedQueUp === queUp.id && (
                  <div className="max-h-[800px] translate-y-0 overflow-hidden border-t border-gray-700/50 px-6 pb-6 opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    {/* Note: 'smooth-accordion-expand' animation approximated with Tailwind's transition utilities. Full effect may require custom animation in Tailwind config. */}
                    <div className="space-y-4 pt-4">
                      {/* Features List */}
                      <div className="space-y-2">
                        {queUp.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-300"
                          >
                            <span className="mr-2 text-cyan-400">•</span>
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                          Message for DJ (Optional)
                        </label>
                        <textarea
                          value={form.submissionMessage}
                          onChange={e =>
                            form.setSubmissionMessage(e.target.value)
                          }
                          placeholder="Any special requests or notes for the DJ?"
                          className="h-20 w-full resize-none rounded-lg border border-gray-600 bg-gray-900/70 p-3 text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={!form.isTraxConfirmed || form.isSubmitting}
                        className={`w-full rounded-lg px-6 py-3 text-white transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 ${
                          queUp.price > 0
                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500'
                            : 'bg-gradient-to-r from-green-600 to-cyan-500'
                        } font-mono font-bold tracking-wider uppercase shadow-lg shadow-cyan-400/30`}
                      >
                        {form.isSubmitting ? (
                          <>
                            <div className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
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
          <div
            className={`rounded-lg p-4 text-center ${
              message.type === 'success'
                ? 'border border-green-500/30 bg-green-900/20 text-green-400'
                : message.type === 'error'
                  ? 'border border-red-500/30 bg-red-900/20 text-red-400'
                  : 'border border-blue-500/30 bg-blue-900/20 text-blue-400'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
      <PaymentModal
        isOpen={form.isPaymentModalOpen}
        onClose={form.handleClosePaymentModal}
        queUp={form.queUpForPayment}
        paymentConfig={paymentConfig}
        submissionId={null}
      />
    </div>
  );
}
