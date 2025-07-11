'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { HostData } from '../../../lib/types';

export default function HostDashboardPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [hostData, setHostData] = useState<HostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHostData = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hosts?clerkUserId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setHostData(data);
      } else {
        throw new Error(`Failed to fetch host data: ${res.statusText}`);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    fetchHostData();
  }, [fetchHostData]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Please sign in to access the Host Dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Loading Host Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!hostData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>No host data found. Please ensure your host profile is set up.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-8 text-center text-4xl font-bold">
        {hostData.name}&apos;s Host Dashboard
      </h1>

      <section className="mb-12 rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-6 text-3xl font-semibold">Your Subscription</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-gray-400">Current Tier:</p>
            <p className="text-xl font-bold">
              {hostData.currentSubscription.tier}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Start Date:</p>
            <p className="text-xl font-bold">
              {new Date(
                hostData.currentSubscription.startDate
              ).toLocaleDateString()}
            </p>
          </div>
          {hostData.currentSubscription.endDate && (
            <div>
              <p className="text-gray-400">End Date:</p>
              <p className="text-xl font-bold">
                {new Date(
                  hostData.currentSubscription.endDate
                ).toLocaleDateString()}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-400">Status:</p>
            <p className="text-xl font-bold">
              {hostData.currentSubscription.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Payment Method:</p>
            <p className="text-xl font-bold">
              {hostData.currentSubscription.paymentMethod}
            </p>
          </div>
        </div>
        <button className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Manage Subscription (Coming Soon)
        </button>
      </section>

      <section className="mb-12 rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-6 text-3xl font-semibold">
          Transparent Fees & Analytics
        </h2>
        <p className="mb-4 text-gray-400">
          Here you will find a detailed breakdown of fees associated with your
          show submissions. Our goal is to maintain full transparency regarding
          operational costs.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-gray-400">Total Submissions This Month:</p>
            <p className="text-xl font-bold">150 (Placeholder)</p>
          </div>
          <div>
            <p className="text-gray-400">Estimated Database Usage Cost:</p>
            <p className="text-xl font-bold">
              $5.25 (Placeholder - based on MongoDB Atlas estimates)
            </p>
          </div>
          <div>
            <p className="text-gray-400">
              Platform Fee (5% of paid submissions):
            </p>
            <p className="text-xl font-bold">
              $12.50 (Placeholder - based on $250 paid submissions)
            </p>
          </div>
          <div>
            <p className="text-gray-400">Total Deducted Fees:</p>
            <p className="text-xl font-bold">$17.75 (Placeholder)</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          *Note: These figures are estimates and will be dynamically calculated
          based on actual usage and payment data. Detailed itemized breakdowns
          will be available here soon.
        </p>
      </section>

      <section className="rounded-lg bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-6 text-3xl font-semibold">
          Payment Gateway Configuration
        </h2>
        <p className="mb-4 text-gray-400">
          Configure the payment gateways your clients will use for submissions.
        </p>
        <div className="mb-4">
          <label
            htmlFor="stripePublicKey"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Stripe Publishable Key
          </label>
          <input
            type="text"
            id="stripePublicKey"
            className="w-full rounded-md border border-gray-600 bg-gray-700 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="pk_test_..."
            value={
              hostData.configuredPaymentGateways?.stripe?.publishableKey || ''
            }
            readOnly // For now, make it read-only as configuration will be via API
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="stripeSecretKey"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Stripe Secret Key
          </label>
          <input
            type="password"
            id="stripeSecretKey"
            className="w-full rounded-md border border-gray-600 bg-gray-700 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="sk_test_..."
            value={hostData.configuredPaymentGateways?.stripe?.secretKey || ''}
            readOnly // For now, make it read-only as configuration will be via API
          />
        </div>
        <button className="mt-6 rounded-md bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700">
          Update Payment Settings (Coming Soon)
        </button>
      </section>
    </div>
  );
}
