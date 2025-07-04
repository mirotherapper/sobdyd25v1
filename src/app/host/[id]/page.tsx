"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

import { HostData } from '../../../../lib/types';

export default function HostProfilePage() {
  const { id } = useParams();
  const [host, setHost] = useState<HostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHostData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hosts/${id}`); // Assuming an API route for single host
      if (res.ok) {
        const data = await res.json();
        setHost(data);
      } else {
        throw new Error(`Failed to fetch host data: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHostData();
  }, [fetchHostData]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Host Profile...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Host not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
          <img
            src={host.profileImage || '/placeholder-user.jpg'}
            alt={host.name}
            className="w-32 h-32 rounded-full object-cover mb-4 md:mb-0 md:mr-8"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">{host.name}</h1>
            <p className="text-gray-400 text-lg mb-4">{host.bio || 'No bio available.'}</p>
            {host.socialLink && (
              <a
                href={host.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Visit Social Profile
              </a>
            )}
          </div>
        </div>

        {host.embedLinks && host.embedLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Featured Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {host.embedLinks.slice(0, 3).map((link, index) => (
                <div key={index} className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={link}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Latest Updates</h2>
          {host.newsFeed ? (
            <p className="text-gray-300">{host.newsFeed}</p>
          ) : (
            <p className="text-gray-500">No recent updates.</p>
          )}
        </section>

        {(host.currentProject || host.latestShow) && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Projects & Shows</h2>
            {host.currentProject && (
              <p className="text-gray-300 mb-2"><strong>Current Project:</strong> {host.currentProject}</p>
            )}
            {host.latestShow && (
              <p className="text-gray-300"><strong>Latest Show:</strong> {host.latestShow}</p>
            )}
          </section>
        )}

        {/* Placeholder for shows hosted by this host */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Shows Hosted</h2>
          <p className="text-gray-500">List of shows hosted by {host.name} will appear here.</p>
        </section>

      </div>
    </div>
  );
}
