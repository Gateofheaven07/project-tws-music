'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PlayerBar } from '@/components/PlayerBar';
import { MusicCard } from '@/components/MusicCard';
import { useMusic } from '@/hooks/useMusic';
import { Loader } from 'lucide-react';

export default function DiscoverPage() {
  const { searchResults, searchQuery, isSearching, searchMusic, getTrendingSongs, trendingSongs, isTrendingLoading } = useMusic();

  useEffect(() => {
    getTrendingSongs();
  }, [getTrendingSongs]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Discover Music" />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {searchQuery ? (
                // Search Results
                <section>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Results for &quot;{searchQuery}&quot;
                    </h2>
                    <p className="text-muted-foreground">Found {searchResults.length} songs</p>
                  </div>

                  {isSearching ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {searchResults.map((song) => (
                        <MusicCard key={song.musicId} song={song} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                      <p className="text-muted-foreground">No results found for &quot;{searchQuery}&quot;</p>
                      <p className="mt-2 text-sm text-muted-foreground">Try a different search term</p>
                    </div>
                  )}
                </section>
              ) : (
                // Default - Show Trending
                <section>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Trending Worldwide</h2>
                    <p className="text-muted-foreground">Check out what&apos;s popular right now</p>
                  </div>

                  {isTrendingLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : trendingSongs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {trendingSongs.map((song) => (
                        <MusicCard key={song.musicId} song={song} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                      <p className="text-muted-foreground">No trending songs available</p>
                    </div>
                  )}
                </section>
              )}
          </div>
        </main>
      </div>
    );
  }
