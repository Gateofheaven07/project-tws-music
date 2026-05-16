'use client';

import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { MusicCard } from '@/components/MusicCard';
import { GenreCard } from '@/components/GenreCard';
import { LandingPage } from '@/components/LandingPage';
import { MobileSidebarButton } from '@/components/Sidebar';

export default function HomePage() {
  const { user } = useAuth();
  const {
    trendingSongs,
    isTrendingLoading,
    getTrendingSongs,
    recommendedSongs,
    recommendationMeta,
    isRecommendationsLoading,
    getRecommendations,
    genres,
    isGenresLoading,
    genresError,
    getGenres,
  } = useMusic();

  useEffect(() => {
    if (!user) return;

    getTrendingSongs();
    getRecommendations();
    getGenres();
  }, [user, getTrendingSongs, getRecommendations, getGenres]);

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Tampilan beranda setelah pengguna masuk */}
      <div className="flex-1 relative flex flex-col h-full bg-gradient-to-b from-[#1F2937]/30 to-background overflow-y-auto">
        {/* Header tetap di atas supaya akses menu mobile tetap dekat */}
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-background/85 px-4 py-3 shadow-sm backdrop-blur-md md:justify-between md:px-8 md:py-6">
          <MobileSidebarButton />
          <div className="flex min-w-0 items-center gap-3 md:hidden">
            <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
            <span className="truncate text-[18px] font-bold text-white">Soundwave</span>
          </div>
          <h2 className="hidden md:block text-[24px] font-bold tracking-tight text-white">Selamat Malam</h2>
        </header>

        {/* Konten utama beranda */}
        <div className="flex flex-col gap-8 px-4 pb-36 pt-6 sm:px-5 md:px-8 md:pb-28">
          <h2 className="md:hidden text-[24px] font-bold tracking-tight text-white mb-[-16px]">Selamat Malam</h2>

          {/* Kategori musik dari Deezer */}
          <section>
            {isGenresLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-md bg-[#292a2a] md:h-20"
                  />
                ))}
              </div>
            ) : genresError ? (
              <p className="text-sm text-[#b3b3b3]">{genresError}</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                {genres.slice(0, 6).map((genre, index) => (
                  <GenreCard
                    key={genre.id}
                    genre={genre}
                    variant="wide"
                    href={`/discover?genreId=${genre.id}&genreName=${encodeURIComponent(genre.name)}`}
                    className={index > 3 ? 'hidden md:flex' : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Bagian rekomendasi personal */}
          <section className="mt-4">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h3 className="text-[24px] font-bold tracking-tight text-white hover:underline cursor-pointer">Dibuat untuk Kamu</h3>
                <p className="mt-1 text-sm text-[#b3b3b3]">
                  {recommendationMeta?.favoriteGenre
                    ? `Berdasarkan genre ${recommendationMeta.favoriteGenre}`
                    : 'Rekomendasi dari musik yang kamu sukai'}
                </p>
              </div>
            </div>
            {isRecommendationsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recommendedSongs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {recommendedSongs.slice(0, 6).map((song, index) => (
                  <MusicCard
                    key={song.musicId}
                    song={song}
                    playQueue={recommendedSongs}
                    queueIndex={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/5 bg-black/10 p-6 text-sm text-[#b3b3b3]">
                Belum ada rekomendasi untuk saat ini.
              </div>
            )}
          </section>

          {/* Bagian musik yang sedang ramai didengar */}
          <section className="mt-4 mb-8">
            <div className="flex items-end justify-between mb-4">
              <h3 className="text-[24px] font-bold tracking-tight text-white hover:underline cursor-pointer">Trending Musik</h3>
              <a className="text-[12px] font-bold text-[#b3b3b3] hover:text-white uppercase tracking-wider" href="#">Tampilkan semua</a>
            </div>

            {isTrendingLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : trendingSongs && trendingSongs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {trendingSongs.map((song, index) => (
                  <MusicCard
                    key={song.musicId}
                    song={song}
                    playQueue={trendingSongs}
                    queueIndex={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[#b3b3b3]">Belum ada data trending saat ini.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
