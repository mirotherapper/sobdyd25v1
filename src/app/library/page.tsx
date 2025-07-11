'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SongData, PlaylistData, ArtistData } from '../../../lib/types';

export default function RecordsLibraryPage() {
  const [artists, setArtists] = useState<ArtistData[]>([]);
  const [songs, setSongs] = useState<SongData[]>([]);
  const [archivedPlaylists, setArchivedPlaylists] = useState<PlaylistData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Artists
      const artistsRes = await fetch('/api/artists'); // Assuming an /api/artists endpoint
      if (artistsRes.ok) {
        const artistsData = await artistsRes.json();
        setArtists(artistsData);
      } else {
        throw new Error(`Failed to fetch artists: ${artistsRes.statusText}`);
      }

      // Fetch Songs (might need a dedicated endpoint or fetch all and filter)
      // For now, let's assume songs can be fetched via a general /api/songs endpoint
      const songsRes = await fetch('/api/songs'); // Assuming an /api/songs endpoint
      if (songsRes.ok) {
        const songsData = await songsRes.json();
        setSongs(songsData);
      } else {
        throw new Error(`Failed to fetch songs: ${songsRes.statusText}`);
      }

      // Fetch Archived Playlists
      const playlistsRes = await fetch('/api/playlist-management');
      if (playlistsRes.ok) {
        const playlistsData = await playlistsRes.json();
        setArchivedPlaylists(
          playlistsData.filter((p: PlaylistData) => p.is_show_archive)
        );
      } else {
        throw new Error(
          `Failed to fetch playlists: ${playlistsRes.statusText}`
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Loading Records Library...
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

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-8 text-center text-4xl font-bold">Records Library</h1>

      <section className="mb-12">
        <h2 className="mb-6 text-3xl font-semibold">Artists</h2>
        {artists.length === 0 ? (
          <p className="text-gray-400">No artists found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artists.map(artist => (
              <div
                key={artist._id}
                className="rounded-lg bg-gray-800 p-6 shadow-lg"
              >
                <Image
                  src={artist.profileImage || '/placeholder-user.jpg'}
                  alt={artist.name}
                  width={96}
                  height={96}
                  className="mx-auto mb-4 h-24 w-24 rounded-full"
                />
                <h3 className="mb-2 text-center text-xl font-bold">
                  {artist.name}
                </h3>
                <p className="mb-4 text-center text-sm text-gray-400">
                  {artist.bio || 'No bio available.'}
                </p>
                <h4 className="mb-2 text-lg font-semibold">Songs:</h4>
                {artist.songs && artist.songs.length > 0 ? (
                  <ul className="list-inside list-disc text-gray-300">
                    {artist.songs.map(song => (
                      <li key={song._id}>{song.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No songs by this artist yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-3xl font-semibold">All Songs</h2>
        {songs.length === 0 ? (
          <p className="text-gray-400">No songs found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {songs.map(song => (
              <div
                key={song._id}
                className="flex items-center space-x-4 rounded-lg bg-gray-800 p-6 shadow-lg"
              >
                <Image
                  src={song.artwork || '/placeholder.jpg'}
                  alt={song.title}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md"
                />
                <div>
                  <h3 className="text-xl font-bold">{song.title}</h3>
                  <p className="text-gray-400">
                    {typeof song.artist === 'string'
                      ? song.artist
                      : song.artist.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Platform: {song.platform}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-3xl font-semibold">Archived Show Playlists</h2>
        {archivedPlaylists.length === 0 ? (
          <p className="text-gray-400">No archived playlists found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {archivedPlaylists.map(playlist => (
              <div
                key={playlist._id}
                className="rounded-lg bg-gray-800 p-6 shadow-lg"
              >
                <h3 className="mb-2 text-xl font-bold">{playlist.name}</h3>
                <p className="mb-2 text-sm text-gray-400">
                  Created: {new Date(playlist.created_at).toLocaleDateString()}
                </p>
                {playlist.finalized_at && (
                  <p className="mb-2 text-sm text-gray-400">
                    Finalized:{' '}
                    {new Date(playlist.finalized_at).toLocaleDateString()}
                  </p>
                )}
                <h4 className="mb-2 text-lg font-semibold">Trax:</h4>
                {playlist.items && playlist.items.length > 0 ? (
                  <ul className="list-inside list-disc text-gray-300">
                    {playlist.items.map(item => (
                      <li key={item._id}>
                        {item.song.title} by{' '}
                        {typeof item.song.artist === 'string'
                          ? item.song.artist
                          : item.song.artist.name}{' '}
                        (Tier: {item.tier})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No trax in this playlist.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
