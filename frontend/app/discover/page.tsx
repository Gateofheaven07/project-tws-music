'use client';

import { Suspense, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { MusicCard } from '@/components/MusicCard';
import { GenreCard } from '@/components/GenreCard';
import { useMusic } from '@/hooks/useMusic';
import { Loader } from 'lucide-react';
import type { Genre } from '@/store/musicStore';

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadedRequestRef = useRef<string | null>(null);

  const {
    searchResults,
    searchQuery,
    isSearching,
    searchMusic,
    setSearchQuery,
    clearSearch,
    getSongsByGenre,
    genres,
    isGenresLoading,
    genresError,
    getGenres,
  } = useMusic();

  useEffect(() => {
    getGenres();
  }, [getGenres]);

  useEffect(() => {
    const query = searchParams.get('q')?.trim();
    const genreId = searchParams.get('genreId')?.trim();
    const genreName = searchParams.get('genreName')?.trim();

    if (genreId && genreName) {
      const requestKey = `genre:${genreId}:${genreName}`;
      if (loadedRequestRef.current === requestKey) return;

      loadedRequestRef.current = requestKey;
      getSongsByGenre({ id: Number(genreId), name: genreName });
      return;
    }

    if (!query) {
      loadedRequestRef.current = null;
      clearSearch();
      return;
    }

    const requestKey = `q:${query}`;
    if (loadedRequestRef.current === requestKey) return;

    loadedRequestRef.current = requestKey;
    setSearchQuery(query);
    searchMusic(query);
  }, [clearSearch, getSongsByGenre, searchParams, searchMusic, setSearchQuery]);

  const handleGenreClick = useCallback(
    (genre: Genre) => {
      loadedRequestRef.current = `genre:${genre.id}:${genre.name}`;
      getSongsByGenre(genre);
      router.replace(`/discover?genreId=${genre.id}&genreName=${encodeURIComponent(genre.name)}`);
    },
    [getSongsByGenre, router]
  );

  const activeGenreName = searchParams.get('genreName')?.trim();
  const hasResultsContext = Boolean(searchQuery);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Cari" />

      <main className="flex-1 overflow-y-auto pb-36 md:pb-28 no-scrollbar">
        <div className="px-4 py-6 sm:px-5 md:p-8">
          {hasResultsContext ? (
            <section>
              <div className="mb-6">
                <h2 className="break-words text-xl font-bold text-foreground sm:text-2xl">
                  {activeGenreName ? `Lagu ${activeGenreName}` : `Hasil untuk "${searchQuery}"`}
                </h2>
                <p className="text-muted-foreground">{searchResults.length} lagu ditemukan</p>
              </div>

              {isSearching ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {searchResults.map((song, index) => (
                    <MusicCard
                      key={song.musicId}
                      song={song}
                      playQueue={searchResults}
                      queueIndex={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center sm:p-12">
                  <p className="text-muted-foreground">
                    {activeGenreName
                      ? `Belum ada lagu untuk genre ${activeGenreName}.`
                      : `Tidak ada hasil untuk "${searchQuery}"`}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Coba kata kunci atau genre lain.
                  </p>
                </div>
              )}
            </section>
          ) : (
            <section>
              <h2 className="text-[24px] font-bold tracking-[-0.02em] leading-[1.2] text-foreground mb-6">
                Jelajahi Semua
              </h2>

              {isGenresLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square animate-pulse rounded-lg bg-[#292a2a]"
                    />
                  ))}
                </div>
              ) : genresError ? (
                <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
                  {genresError}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                  {genres.map((genre) => (
                    <GenreCard key={genre.id} genre={genre} onClick={handleGenreClick} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full overflow-hidden">
          <Header title="Cari" />
          <div className="flex flex-1 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
