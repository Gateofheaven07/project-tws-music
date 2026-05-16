'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  ListMusic,
  Loader2,
  Play,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { MusicCard } from '@/components/MusicCard';
import { MobileSidebarButton } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { usePlayerStore, type Song } from '@/store/playerStore';

const formatDuration = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getCoverUrl = (song: Song) => (
  song.album.cover.medium ||
  song.album.cover.small ||
  song.album.cover.big ||
  song.album.cover.xl ||
  ''
);

export default function QueueBuilderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [draftQuery, setDraftQuery] = useState('');

  const {
    searchResults,
    searchQuery,
    isSearching,
    searchMusic,
    clearSearch,
  } = useMusic();

  const {
    queue,
    currentSong,
    currentSongIndex,
    isPlaying,
    startPlayback,
    removeFromQueue,
    moveInQueue,
    clearQueue,
    togglePlayPause,
  } = usePlayerStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

  }, [router, user]);

  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

  const hasSearchContext = searchQuery.trim().length > 0;
  const queueDuration = useMemo(
    () => queue.reduce((total, song) => total + (song.duration || 0), 0),
    [queue]
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = draftQuery.trim();
    if (!query) {
      clearSearch();
      return;
    }

    searchMusic(query);
  };

  const handleClearSearch = () => {
    setDraftQuery('');
    clearSearch();
  };

  const handlePlayQueue = (index = 0) => {
    if (!queue.length) return;

    const targetSong = queue[index];
    if (targetSong?.playback?.status === 'unavailable') return;

    const isCurrentQueueItem =
      currentSong?.musicId === targetSong.musicId && currentSongIndex === index;

    if (isCurrentQueueItem) {
      togglePlayPause();
      return;
    }

    startPlayback(queue, index);
  };

  if (!user) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#1f2937]/30 to-background">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/90 px-4 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl md:px-8 md:py-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <MobileSidebarButton />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Antrean Lokal
              </p>
              <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">
                Buat Daftar Putar
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Susun urutan lagu yang ingin kamu dengarkan sekarang.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
              <Input
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Cari lagu atau artis"
                className="h-12 rounded-full border-white/10 bg-black/35 pl-12 pr-12 text-base text-white placeholder:text-white/35"
                aria-label="Cari lagu untuk daftar putar"
              />
              {draftQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary transition hover:bg-white/10 hover:text-white"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={isSearching} className="h-12 rounded-full px-5">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cari'}
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-36 pt-6 md:px-8 md:pb-28">
        <div className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {hasSearchContext ? `Hasil untuk "${searchQuery}"` : 'Cari Lagu'}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {hasSearchContext
                    ? `${searchResults.length} lagu ditemukan`
                    : 'Masukkan judul lagu atau nama artis untuk menambah antrean.'}
                </p>
              </div>
            </div>

            {isSearching ? (
              <div className="flex min-h-64 items-center justify-center rounded-lg border border-white/5 bg-black/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : hasSearchContext && searchResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {searchResults.map((song, index) => (
                  <MusicCard
                    key={`${song.musicId}-${index}`}
                    song={song}
                    playQueue={searchResults}
                    queueIndex={index}
                  />
                ))}
              </div>
            ) : hasSearchContext ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 p-8 text-center">
                <Search className="mb-4 h-10 w-10 text-text-secondary" />
                <h3 className="text-lg font-bold text-white">Belum ada lagu yang cocok</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                  Coba kata kunci lain atau pakai nama artis yang lebih spesifik.
                </p>
              </div>
            ) : (
              <div className="flex min-h-40 flex-col justify-center rounded-lg border border-white/5 bg-black/10 p-6">
                <h3 className="text-lg font-bold text-white">Mulai dari pencarian</h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">
                  Cari lagu yang kamu mau, lalu tekan ikon daftar pada kartu musik untuk memasukkannya ke antrean.
                </p>
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-28 xl:self-start">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#18181b]/95 shadow-2xl">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">Daftar Antrean</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      {queue.length} lagu - {formatDuration(queueDuration)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handlePlayQueue(0)}
                    disabled={!queue.length}
                    size="sm"
                    className="rounded-full"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Putar
                  </Button>
                </div>

                {queue.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearQueue}
                    className="mt-4 h-10 w-full justify-center rounded-full text-text-secondary hover:bg-white/10 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Kosongkan antrean
                  </Button>
                )}
              </div>

              {queue.length > 0 ? (
                <div className="max-h-[62vh] overflow-y-auto p-2">
                  {queue.map((song, index) => {
                    const isCurrent =
                      currentSong?.musicId === song.musicId && currentSongIndex === index;
                    const isUnavailable = song.playback?.status === 'unavailable';
                    const coverUrl = getCoverUrl(song);

                    return (
                      <div
                        key={`${song.musicId}-${index}`}
                        className={cn(
                          'group grid grid-cols-[34px_44px_minmax(0,1fr)_84px] items-center gap-2 rounded-lg p-2 transition-colors sm:grid-cols-[34px_44px_minmax(0,1fr)_92px] sm:gap-3',
                          isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handlePlayQueue(index)}
                          disabled={isUnavailable}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition',
                            isCurrent
                              ? 'text-primary'
                              : 'text-text-secondary hover:bg-white/10 hover:text-white',
                            isUnavailable && 'cursor-not-allowed opacity-45'
                          )}
                          aria-label={`Putar ${song.title}`}
                        >
                          {isCurrent && isPlaying ? (
                            <span className="material-symbols-outlined text-[20px]">pause</span>
                          ) : (
                            <Play className="h-4 w-4 fill-current" />
                          )}
                        </button>

                        <div className="relative h-11 w-11 overflow-hidden rounded bg-surface-interactive">
                          {coverUrl ? (
                            <Image
                              src={coverUrl}
                              alt={song.title}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#252525]">
                              <ListMusic className="h-5 w-5 text-text-secondary" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={cn(
                              'truncate text-sm font-bold',
                              isCurrent ? 'text-primary' : 'text-white'
                            )}
                          >
                            {song.title}
                          </p>
                          <p className="truncate text-xs text-text-secondary">{song.artist.name}</p>
                          {isUnavailable && (
                            <p className="truncate text-[11px] text-amber-300/90">
                              Playback belum tersedia.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => moveInQueue(index, index - 1)}
                            disabled={index === 0}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Naikkan ${song.title}`}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveInQueue(index, index + 1)}
                            disabled={index === queue.length - 1}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Turunkan ${song.title}`}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromQueue(index)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-red-500/10 hover:text-red-300"
                            aria-label={`Hapus ${song.title} dari antrean`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-text-secondary">
                    <ListMusic className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Antrean masih kosong</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-text-secondary">
                    Tambahkan lagu dari kartu musik atau menu tiga titik untuk mulai menyusun urutan.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
