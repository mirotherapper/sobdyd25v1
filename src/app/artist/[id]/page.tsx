"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

import { SongData, ArtistData } from '../../../../lib/types';

export default function ArtistProfilePage() {
  const { id } = useParams();
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArtistData();
  }, [fetchArtistData]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Artist Profile...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Artist not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
          <img
            src={artist.profileImage || '/placeholder-user.jpg'}
            alt={artist.name}
            className="w-32 h-32 rounded-full object-cover mb-4 md:mb-0 md:mr-8"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">{artist.name}</h1>
            <p className="text-gray-400 text-lg mb-4">{artist.bio || 'No bio available.'}</p>
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
            <h2 className="text-2xl font-semibold mb-4">Featured Music/Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artist.embedLinks.slice(0, 3).map((link, index) => (
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
          {artist.newsFeed ? (
            <p className="text-gray-300">{artist.newsFeed}</p>
          ) : (
            <p className="text-gray-500">No recent updates.</p>
          )}
        </section>

        {(artist.currentProject || artist.latestAlbum) && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Projects & Albums</h2>
            {artist.currentProject && (
              <p className="text-gray-300 mb-2"><strong>Current Project:</strong> {artist.currentProject}</p>
            )}
            {artist.latestAlbum && (
              <p className="text-gray-300"><strong>Latest Album:</strong> {artist.latestAlbum}</p>
            )}
          </section>
        )}

        {artist.songs && artist.songs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Songs on Record</h2>
            <ul className="list-disc list-inside text-gray-300">
              {artist.songs.map((song) => (
                <li key={song._id} className="mb-1">
                  {song.title} (by {typeof song.artist === 'object' ? song.artist.name : song.artist})
                </li>
              ))}
            </ul>
          </section>
        )}

        {artist.shows && artist.shows.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Show Appearances</h2>
            <ul className="list-disc list-inside text-gray-300">
              {artist.shows.map((show, index) => (
                <li key={index} className="mb-1">
                  {show.playlistName} on {new Date(show.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </section>
        )}

        {artist.awards && artist.awards.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Awards & Recognition</h2>
            <ul className="list-disc list-inside text-gray-300">
              {artist.awards.map((award, index) => (
                <li key={index} className="mb-1">{award}</li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}
