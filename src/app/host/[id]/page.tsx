'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import { HostData } from '../../../../lib/types';

export default function HostProfilePage() {
  const params = useParams();
  const id = params?.id as string;
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
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHostData();
  }, [fetchHostData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Loading Host Profile...
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

  if (!host) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Host not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-4xl rounded-lg bg-gray-800 p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center md:flex-row md:items-start">
          <Image
            src={host.profileImage || '/placeholder-user.jpg'}
            alt={host.name}
            width={128}
            height={128}
            className="mb-4 h-32 w-32 rounded-full object-cover md:mr-8 md:mb-0"
          />
          <div className="text-center md:text-left">
            <h1 className="mb-2 text-4xl font-bold">{host.name}</h1>
            <p className="mb-4 text-lg text-gray-400">
              {host.bio || 'No bio available.'}
            </p>
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
            <h2 className="mb-4 text-2xl font-semibold">Featured Content</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {host.embedLinks.slice(0, 3).map((link, index) => (
                <div
                  key={index}
                  className="aspect-video overflow-hidden rounded-lg bg-black"
                >
                  <iframe
                    src={link}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  ></iframe>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Latest Updates</h2>
          {host.newsFeed ? (
            <p className="text-gray-300">{host.newsFeed}</p>
          ) : (
            <p className="text-gray-500">No recent updates.</p>
          )}
        </section>

        {(host.currentProject || host.latestShow) && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Projects & Shows</h2>
            {host.currentProject && (
              <p className="mb-2 text-gray-300">
                <strong>Current Project:</strong> {host.currentProject}
              </p>
            )}
            {host.latestShow && (
              <p className="text-gray-300">
                <strong>Latest Show:</strong> {host.latestShow}
              </p>
            )}
          </section>
        )}

        {/* Placeholder for shows hosted by this host */}
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Shows Hosted</h2>
          <p className="text-gray-500">
            List of shows hosted by {host.name} will appear here.
          </p>
        </section>
      </div>
    </div>
  );
}
