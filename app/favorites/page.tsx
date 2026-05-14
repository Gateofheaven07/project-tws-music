'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PlayerBar } from '@/components/PlayerBar';
import { MusicCard } from '@/components/MusicCard';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { Loader } from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { favoriteSongs, isFavoritesLoading, getFavorites } = useMusic();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    getFavorites();
  }, [user, router, getFavorites]);

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
          <Header title="Your Favorite Songs" />

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {isFavoritesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : favoriteSongs.length > 0 ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Liked Songs</h2>
                    <p className="text-muted-foreground">{favoriteSongs.length} songs in your favorites</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {favoriteSongs.map((song) => (
                      <MusicCard key={song.id} song={song} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No favorite songs yet</h3>
                  <p className="mb-6 text-muted-foreground">
                    Start adding songs to your favorites by clicking the heart icon.
                  </p>
                  <Link
                    href="/discover"
                    className="inline-block rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Discover Music
                  </Link>
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
