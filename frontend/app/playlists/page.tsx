'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PlayerBar } from '@/components/PlayerBar';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Loader, Trash2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  songs?: any[];
}

export default function PlaylistsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchPlaylists();
  }, [user, router, accessToken]);

  const fetchPlaylists = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const response = await axios.get('/api/playlists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPlaylists(response.data.data);
    } catch (error) {
      console.error('[v0] Fetch playlists error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !accessToken) return;

    setIsCreating(true);
    try {
      const response = await axios.post(
        '/api/playlists',
        {
          name: newPlaylistName,
          description: newPlaylistDesc,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setPlaylists([response.data.data, ...playlists]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('[v0] Create playlist error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!accessToken) return;
    try {
      await axios.delete(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPlaylists(playlists.filter((p) => p.id !== id));
    } catch (error) {
      console.error('[v0] Delete playlist error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Your Playlists" />

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {/* Create Playlist Section */}
              <div className="mb-8">
                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-5 w-5" />
                    Create New Playlist
                  </button>
                ) : (
                  <form onSubmit={handleCreatePlaylist} className="rounded-lg border border-border bg-card p-6 max-w-md">
                    <input
                      type="text"
                      placeholder="Playlist name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                      autoFocus
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newPlaylistDesc}
                      onChange={(e) => setNewPlaylistDesc(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isCreating || !newPlaylistName.trim()}
                        className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                      >
                        {isCreating && <Loader className="h-4 w-4 animate-spin" />}
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewPlaylistName('');
                          setNewPlaylistDesc('');
                        }}
                        className="flex-1 rounded-lg border border-border px-4 py-2 font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Playlists Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : playlists.length > 0 ? (
                <>
                  <h2 className="mb-6 text-2xl font-bold text-foreground">{playlists.length} Playlists</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {playlists.map((playlist) => (
                      <Link
                        key={playlist.id}
                        href={`/playlists/${playlist.id}`}
                        className="group rounded-lg border border-border bg-card p-6 hover:border-primary hover:bg-card/80 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {playlist.name}
                            </h3>
                            {playlist.description && (
                              <p className="mt-1 text-sm text-muted-foreground">{playlist.description}</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeletePlaylist(playlist.id);
                            }}
                            className="text-muted-foreground hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {playlist.songs?.length || 0} songs • {playlist.isPublic ? 'Public' : 'Private'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No playlists yet</h3>
                  <p className="mb-6 text-muted-foreground">Create your first playlist to organize your music</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-5 w-5" />
                    Create Playlist
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Player Bar */}
      <div className="flex-shrink-0">
        <PlayerBar />
      </div>
    </div>
  );
}
