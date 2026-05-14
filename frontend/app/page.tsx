'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MusicCard } from '@/components/MusicCard';
import Link from 'next/link';
import { Loader } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { trendingSongs, isTrendingLoading, getTrendingSongs } = useMusic();

  useEffect(() => {
    getTrendingSongs();
  }, [getTrendingSongs]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Welcome to SoundWave" />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
          {!user ? (
            // Not authenticated
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="mb-4 text-3xl font-bold">Welcome to SoundWave</h2>
                <p className="mb-8 text-muted-foreground">Sign in to discover and enjoy your favorite music.</p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/login"
                    className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full border-2 border-primary px-8 py-3 font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {/* Trending Section */}
              <section className="mb-12">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
                  <p className="text-muted-foreground">Check out what&apos;s hot right now</p>
                </div>

                {isTrendingLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : trendingSongs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {trendingSongs.slice(0, 10).map((song) => (
                      <MusicCard key={song.id} song={song} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                    <p className="text-muted-foreground">No trending songs available</p>
                  </div>
                )}
              </section>

              {/* Quick Links */}
              <section className="mb-12">
                <h2 className="mb-6 text-2xl font-bold text-foreground">Get Started</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Link
                    href="/discover"
                    className="rounded-lg border-2 border-primary/20 bg-card p-6 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <h3 className="mb-2 font-semibold text-foreground">Discover Music</h3>
                    <p className="text-sm text-muted-foreground">Explore new songs and artists</p>
                  </Link>
                  <Link
                    href="/playlists"
                    className="rounded-lg border-2 border-primary/20 bg-card p-6 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <h3 className="mb-2 font-semibold text-foreground">Your Playlists</h3>
                    <p className="text-sm text-muted-foreground">Create and manage playlists</p>
                  </Link>
                  <Link
                    href="/favorites"
                    className="rounded-lg border-2 border-primary/20 bg-card p-6 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <h3 className="mb-2 font-semibold text-foreground">Favorites</h3>
                    <p className="text-sm text-muted-foreground">Your liked songs collection</p>
                  </Link>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
