'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  Heart,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SongContextMenu } from '@/components/SongContextMenu';
import { useMusic } from '@/hooks/useMusic';
import { cn } from '@/lib/utils';
import { useMusicStore } from '@/store/musicStore';
import { usePlayerStore } from '@/store/playerStore';

/**
 * Layar penuh untuk lagu yang sedang diputar.
 * Cover lagu dibuat memenuhi layar seperti Spotify, sementara kontrol tetap mudah dijangkau.
 */
export const NowPlayingModal = () => {
  const [imgError, setImgError] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    isShuffle,
    isMuted,
    showNowPlaying,
    togglePlayPause,
    setCurrentTime,
    setVolume,
    toggleMute,
    next,
    previous,
    setRepeatMode,
    toggleShuffle,
    setShowNowPlaying,
  } = usePlayerStore();

  const { favoriteSongs } = useMusicStore();
  const { addFavorite, removeFavorite } = useMusic();

  useEffect(() => {
    setImgError(false);
    setContextMenu(null);
  }, [currentSong?.musicId]);

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong || !showNowPlaying) return null;

  const isFavorited = favoriteSongs.some((song) => song.musicId === currentSong.musicId);
  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const coverUrl =
    currentSong.album.cover.xl ||
    currentSong.album.cover.big ||
    currentSong.album.cover.medium ||
    currentSong.album.cover.small ||
    '';

  const sourceLabel = currentSong.album.name ? 'MEMAINKAN DARI ALBUM' : 'SEDANG DIPUTAR';
  const sourceName = currentSong.album.name || 'SoundWave';

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFavorite(currentSong.musicId);
      return;
    }

    addFavorite(currentSong);
  };

  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setContextMenu({ x: rect.left - 180, y: rect.bottom + 8 });
  };

  const cycleRepeatMode = () => {
    setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off');
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100] min-h-dvh overflow-y-auto bg-black text-white"
        role="dialog"
        aria-modal="true"
        aria-label={`Player penuh untuk ${currentSong.title}`}
        style={{ animation: 'nowPlayingIn 260ms cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="absolute inset-0">
          {coverUrl && !imgError ? (
            <Image
              src={coverUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,#2b5f45_0%,#121212_45%,#000000_100%)]">
              <Music2 className="h-28 w-28 text-white/10" aria-hidden="true" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/95" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div
          className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-7 sm:px-8"
          style={{
            paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
            paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))',
          }}
        >
          <header className="flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowNowPlaying(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition hover:bg-white/10 active:scale-95"
              aria-label="Minimalkan player"
            >
              <ChevronDown className="h-8 w-8" aria-hidden="true" />
            </button>

            <div className="min-w-0 pt-1 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                {sourceLabel}
              </p>
              <p className="mt-1 truncate text-base font-extrabold leading-tight text-white">
                {sourceName}
              </p>
            </div>

            <button
              type="button"
              onClick={handleMenuClick}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition hover:bg-white/10 active:scale-95"
              aria-label="Buka opsi lagu"
            >
              <MoreHorizontal className="h-7 w-7" aria-hidden="true" />
            </button>
          </header>

          <main className="flex flex-1 flex-col justify-end pt-10">
            <section className="space-y-6">
              <div className="flex items-end justify-between gap-5">
                <div className="min-w-0">
                  <h1 className="truncate text-3xl font-black leading-none text-white drop-shadow-2xl sm:text-5xl md:text-6xl">
                    {currentSong.title}
                  </h1>
                  <p className="mt-2 truncate text-xl font-semibold text-white/75 drop-shadow-lg">
                    {currentSong.artist.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition active:scale-95 sm:h-14 sm:w-14',
                    isFavorited ? 'text-[#1ed760]' : 'text-white/80 hover:text-white'
                  )}
                  aria-label={
                    isFavorited ? 'Hapus dari lagu yang disukai' : 'Tambahkan ke lagu yang disukai'
                  }
                >
                  <Heart className={cn('h-7 w-7 sm:h-9 sm:w-9', isFavorited && 'fill-current')} aria-hidden="true" />
                </button>
              </div>

              <div>
                <div className="relative h-5 touch-manipulation">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime || 0}
                    onChange={(event) => setCurrentTime(parseFloat(event.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Atur posisi lagu"
                    style={{ margin: 0 }}
                  />
                </div>

                <div className="mt-1 flex justify-between text-sm font-semibold text-white/70">
                  <span className="tabular-nums">{formatTime(currentTime)}</span>
                  <span className="tabular-nums">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleShuffle}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 sm:h-12 sm:w-12',
                    isShuffle ? 'text-[#1ed760]' : 'text-white/75 hover:text-white'
                  )}
                  aria-label="Acak lagu"
                >
                  <Shuffle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={previous}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10 active:scale-95 sm:h-14 sm:w-14"
                  aria-label="Lagu sebelumnya"
                >
                  <SkipBack className="h-8 w-8 fill-current sm:h-10 sm:w-10" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition hover:scale-105 active:scale-95 sm:h-20 sm:w-20"
                  aria-label={isPlaying ? 'Jeda lagu' : 'Putar lagu'}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 fill-black sm:h-9 sm:w-9" aria-hidden="true" />
                  ) : (
                    <Play className="ml-1 h-8 w-8 fill-black sm:h-9 sm:w-9" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={next}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10 active:scale-95 sm:h-14 sm:w-14"
                  aria-label="Lagu berikutnya"
                >
                  <SkipForward className="h-8 w-8 fill-current sm:h-10 sm:w-10" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={cycleRepeatMode}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 sm:h-12 sm:w-12',
                    repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-white/75 hover:text-white'
                  )}
                  aria-label="Ulangi lagu"
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                  ) : (
                    <Repeat className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
                  aria-label={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
                >
                  {isMuted ? (
                    <VolumeX className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>

                <div className="relative h-5 flex-1 touch-manipulation">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white/75"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(event) => {
                      setVolume(parseFloat(event.target.value));
                      if (isMuted) toggleMute();
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Atur volume"
                    style={{ margin: 0 }}
                  />
                </div>
              </div>
            </section>
          </main>
        </div>

        <style jsx>{`
          @keyframes nowPlayingIn {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>

      {contextMenu && (
        <SongContextMenu
          song={currentSong}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};
