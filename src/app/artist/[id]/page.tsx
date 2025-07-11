'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import { ArtistData } from '../../../../lib/types';

export default function ArtistProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtistData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/artists/${id}`); // Assuming an API route for single artist
      if (res.ok) {
        const data = await res.json();
        setArtist(data);
      } else {
        throw new Error(`Failed to fetch artist data: ${res.statusText}`);
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
    fetchArtistData();
  }, [fetchArtistData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Loading Artist Profile...
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

  if (!artist) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Artist not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-4xl rounded-lg bg-gray-800 p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center md:flex-row md:items-start">
          <Image
            src={artist.profileImage || '/placeholder-user.jpg'}
            alt={artist.name}
            width={128}
            height={128}
            className="mb-4 h-32 w-32 rounded-full object-cover md:mr-8 md:mb-0"
          />
          <div className="text-center md:text-left">
            <h1 className="mb-2 text-4xl font-bold">{artist.name}</h1>
            <p className="mb-4 text-lg text-gray-400">
              {artist.bio || 'No bio available.'}
            </p>
            {artist.socialLink && (
              <a
                href={artist.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Visit Social Profile
              </a>
            )}
          </div>
        </div>

        {artist.embedLinks && artist.embedLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Featured Music/Videos
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {artist.embedLinks.slice(0, 3).map((link, index) => (
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
          {artist.newsFeed ? (
            <p className="text-gray-300">{artist.newsFeed}</p>
          ) : (
            <p className="text-gray-500">No recent updates.</p>
          )}
        </section>

        {(artist.currentProject || artist.latestAlbum) && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Projects & Albums</h2>
            {artist.currentProject && (
              <p className="mb-2 text-gray-300">
                <strong>Current Project:</strong> {artist.currentProject}
              </p>
            )}
            {artist.latestAlbum && (
              <p className="text-gray-300">
                <strong>Latest Album:</strong> {artist.latestAlbum}
              </p>
            )}
          </section>
        )}

        {artist.songs && artist.songs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Songs on Record</h2>
            <ul className="list-inside list-disc text-gray-300">
              {artist.songs.map(song => (
                <li key={song._id} className="mb-1">
                  {song.title} (by{' '}
                  {typeof song.artist === 'object'
                    ? song.artist.name
                    : song.artist}
                  )
                </li>
              ))}
            </ul>
          </section>
        )}

        {artist.shows && artist.shows.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Show Appearances</h2>
            <ul className="list-inside list-disc text-gray-300">
              {artist.shows.map((show, index) => (
                <li key={index} className="mb-1">
                  {show.playlistName} on{' '}
                  {new Date(show.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </section>
        )}

        {artist.awards && artist.awards.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Awards & Recognition
            </h2>
            <ul className="list-inside list-disc text-gray-300">
              {artist.awards.map((award, index) => (
                <li key={index} className="mb-1">
                  {award}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
