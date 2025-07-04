"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { SongData, PlaylistItemData, PlaylistData, ArtistData } from '../../../lib/types';

export default function RecordsLibraryPage() {
  const [artists, setArtists] = useState<ArtistData[]>([]);
  const [songs, setSongs] = useState<SongData[]>([]);
  const [archivedPlaylists, setArchivedPlaylists] = useState<PlaylistData[]>([]);
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
        setArchivedPlaylists(playlistsData.filter((p: PlaylistData) => p.is_show_archive));
      } else {
        throw new Error(`Failed to fetch playlists: ${playlistsRes.statusText}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Records Library...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Records Library</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Artists</h2>
        {artists.length === 0 ? (
          <p className="text-gray-400">No artists found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <div key={artist._id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <img src={artist.profileImage || '/placeholder-user.jpg'} alt={artist.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-bold text-center mb-2">{artist.name}</h3>
                <p className="text-gray-400 text-sm text-center mb-4">{artist.bio || 'No bio available.'}</p>
                <h4 className="text-lg font-semibold mb-2">Songs:</h4>
                {artist.songs && artist.songs.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-300">
                    {artist.songs.map((song) => (
                      <li key={song._id}>{song.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No songs by this artist yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">All Songs</h2>
        {songs.length === 0 ? (
          <p className="text-gray-400">No songs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <div key={song._id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
                <img src={song.artwork || '/placeholder.jpg'} alt={song.title} className="w-16 h-16 rounded-md" />
                <div>
                  <h3 className="text-xl font-bold">{song.title}</h3>
                  <p className="text-gray-400">{typeof song.artist === 'string' ? song.artist : song.artist.name}</p>
                  <p className="text-sm text-gray-500">Platform: {song.platform}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6">Archived Show Playlists</h2>
        {archivedPlaylists.length === 0 ? (
          <p className="text-gray-400">No archived playlists found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {archivedPlaylists.map((playlist) => (
              <div key={playlist._id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">{playlist.name}</h3>
                <p className="text-gray-400 text-sm mb-2">Created: {new Date(playlist.created_at).toLocaleDateString()}</p>
                {playlist.finalized_at && (
                  <p className="text-gray-400 text-sm mb-2">Finalized: {new Date(playlist.finalized_at).toLocaleDateString()}</p>
                )}
                <h4 className="text-lg font-semibold mb-2">Tracks:</h4>
                {playlist.items && playlist.items.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-300">
                    {playlist.items.map((item) => (
                      <li key={item._id}>{item.song.title} by {typeof item.song.artist === 'string' ? item.song.artist : item.song.artist.name} (Tier: {item.tier})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No tracks in this playlist.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
