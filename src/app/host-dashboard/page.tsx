"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { HostSubscriptionData, HostData } from '../../../lib/types';

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    fetchHostData();
  }, [fetchHostData]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Please sign in to access the Host Dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Host Dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;
  }

  if (!hostData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>No host data found. Please ensure your host profile is set up.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{hostData.name}'s Host Dashboard</h1>

      <section className="mb-12 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold mb-6">Your Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Current Tier:</p>
            <p className="text-xl font-bold">{hostData.currentSubscription.tier}</p>
          </div>
          <div>
            <p className="text-gray-400">Start Date:</p>
            <p className="text-xl font-bold">{new Date(hostData.currentSubscription.startDate).toLocaleDateString()}</p>
          </div>
          {hostData.currentSubscription.endDate && (
            <div>
              <p className="text-gray-400">End Date:</p>
              <p className="text-xl font-bold">{new Date(hostData.currentSubscription.endDate).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400">Status:</p>
            <p className="text-xl font-bold">{hostData.currentSubscription.isActive ? 'Active' : 'Inactive'}</p>
          </div>
          <div>
            <p className="text-gray-400">Payment Method:</p>
            <p className="text-xl font-bold">{hostData.currentSubscription.paymentMethod}</p>
          </div>
        </div>
        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
          Manage Subscription (Coming Soon)
        </button>
      </section>

      <section className="mb-12 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold mb-6">Transparent Fees & Analytics</h2>
        <p className="text-gray-400 mb-4">
          Here you will find a detailed breakdown of fees associated with your show submissions.
          Our goal is to maintain full transparency regarding operational costs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Total Submissions This Month:</p>
            <p className="text-xl font-bold">150 (Placeholder)</p>
          </div>
          <div>
            <p className="text-gray-400">Estimated Database Usage Cost:</p>
            <p className="text-xl font-bold">$5.25 (Placeholder - based on MongoDB Atlas estimates)</p>
          </div>
          <div>
            <p className="text-gray-400">Platform Fee (5% of paid submissions):</p>
            <p className="text-xl font-bold">$12.50 (Placeholder - based on $250 paid submissions)</p>
          </div>
          <div>
            <p className="text-gray-400">Total Deducted Fees:</p>
            <p className="text-xl font-bold">$17.75 (Placeholder)</p>
          </div>
        </div>
        <p className="mt-4 text-gray-500 text-sm">
          *Note: These figures are estimates and will be dynamically calculated based on actual usage and payment data.
          Detailed itemized breakdowns will be available here soon.
        </p>
      </section>

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold mb-6">Payment Gateway Configuration</h2>
        <p className="text-gray-400 mb-4">
          Configure the payment gateways your clients will use for submissions.
        </p>
        <div className="mb-4">
          <label htmlFor="stripePublicKey" className="block text-sm font-medium text-gray-300 mb-2">Stripe Publishable Key</label>
          <input
            type="text"
            id="stripePublicKey"
            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="pk_test_..."
            value={hostData.configuredPaymentGateways?.stripe?.publishableKey || ''}
            readOnly // For now, make it read-only as configuration will be via API
          />
        </div>
        <div className="mb-4">
          <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-300 mb-2">Stripe Secret Key</label>
          <input
            type="password"
            id="stripeSecretKey"
            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk_test_..."
            value={hostData.configuredPaymentGateways?.stripe?.secretKey || ''}
            readOnly // For now, make it read-only as configuration will be via API
          />
        </div>
        <button className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
          Update Payment Settings (Coming Soon)
        </button>
      </section>
    </div>
  );
}
