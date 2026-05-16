'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  Loader,
  X,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useMusicStore } from '@/store/musicStore';
import { useMusic } from '@/hooks/useMusic';
import { cn } from '@/lib/utils';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Song } from '@/store/playerStore';

/**
 * Bar Player di bagian bawah — pusat kontrol musik kita (versi mini).
 * Klik area info lagu di kiri untuk membuka full player view (NowPlayingModal).
 * Tombol X di kanan untuk menutup musik yang sedang diputar.
 */
export const PlayerBar = () => {
  const [isFetchingId, setIsFetchingId] = useState(false);
  const [volume, setVolumeState] = useState(0.7);

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume: storeVolume,
    repeatMode,
    isShuffle,
    play,
    pause,
    stop,
    togglePlayPause,
    setCurrentTime,
    setDuration,
    setVolume,
    next,
    previous,
    setRepeatMode,
    toggleShuffle,
    setShowNowPlaying,
  } = usePlayerStore();

  const { favoriteSongs } = useMusicStore();
  const { addFavorite, removeFavorite } = useMusic();

  const isFavorited = currentSong &&
    favoriteSongs.some((s) => s.musicId === currentSong.musicId);

  // Efek buat nyari Video ID YouTube tiap kali lagu aktif berganti.
  // Kita hanya fetch kalau lagu belum punya videoId (artinya belum siap diputar).
  useEffect(() => {
    const fetchVideoId = async () => {
      // Kalau tidak ada lagu, atau videoId sudah ada, langsung skip — tidak perlu fetch lagi.
      if (
        !currentSong ||
        currentSong.playback?.videoId ||
        currentSong.playback?.status === 'unavailable'
      ) return;

      setIsFetchingId(true);
      try {
        const response = await api.get('/music/stream-id', {
          params: {
            // Kirim nama artis sebagai string, bukan objek.
            artist: currentSong.artist.name,
            title: currentSong.title,
          },
        });

        const videoId = response.data?.data?.videoId;
        if (videoId) {
          // Buat objek lagu yang sudah diperbarui dengan videoId baru,
          // lalu update queue di store supaya perubahannya reaktif.
          const updatedSong: Song = {
            ...currentSong,
            playback: {
              ...currentSong.playback,
              status: 'ready',
              videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
              errorReason: null,
            },
          };

          // Update queue dengan lagu yang sudah ada videoId-nya
          const currentQueue = usePlayerStore.getState().queue;
          const currentIndex = usePlayerStore.getState().currentSongIndex;
          const newQueue = [...currentQueue];
          newQueue[currentIndex] = updatedSong;

          usePlayerStore.setState({
            queue: newQueue,
            currentSong: updatedSong,
            // Pastikan isPlaying tetap true supaya YouTubePlayer langsung memutar
            isPlaying: true,
          });
        }
      } catch (error) {
        console.warn(getApiErrorMessage(error, 'Video ID belum bisa diambil.'));
      } finally {
        setIsFetchingId(false);
      }
    };

    fetchVideoId();
  }, [currentSong?.musicId]); // Hanya re-run kalau lagu yang aktif benar-benar berganti

  // Format waktu (detik ke mm:ss)
  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // YouTubePlayer dikelola di LayoutContent (level layout global).
  if (!currentSong) return null;

  const isPlaybackUnavailable = currentSong.playback?.status === 'unavailable';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex min-h-[112px] flex-col gap-2 border-t border-[#282828] bg-black px-3 py-2 shadow-2xl sm:px-4 md:h-[90px] md:min-h-0 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >

      {/* ── Kiri: Info Lagu (klik untuk buka full player) ─── */}
      <div
        className="group flex w-full min-w-0 cursor-pointer items-center gap-3 md:w-[30%] md:min-w-[180px] md:gap-4"
        onClick={() => setShowNowPlaying(true)}
        title="Buka player penuh"
      >
        {/* Album Cover */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[4px] bg-[#181818] shadow-lg md:h-14 md:w-14">
          {currentSong.album.cover.small ? (
            <Image
              src={currentSong.album.cover.small}
              alt={currentSong.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-full w-full bg-[#181818]" />
          )}
        </div>

        {/* Judul & Artis */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-[14px] text-white group-hover:underline underline-offset-2 transition-colors">
            {currentSong.title}
          </p>
          <p className="truncate text-[11px] text-[#b3b3b3] group-hover:text-white transition-colors">
            {currentSong.artist.name}
          </p>
        </div>

        {/* Tombol Like */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Jangan trigger open modal
            if (isFavorited) {
              removeFavorite(currentSong.musicId);
            } else {
              addFavorite(currentSong);
            }
          }}
          className={cn(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors',
            isFavorited ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
          )}
          title={isFavorited ? 'Hapus dari Liked Songs' : 'Tambah ke Liked Songs'}
        >
          <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            stop();
          }}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[#b3b3b3] transition-all hover:bg-white/10 hover:text-white md:hidden"
          title="Tutup musik"
          aria-label="Tutup musik"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Tengah: Kontrol & Progress Bar ──────────────── */}
      <div className="flex w-full flex-col items-center gap-2 md:max-w-[40%]">
        {/* Tombol Kontrol */}
        <div className="flex w-full items-center justify-center gap-2 sm:gap-4 md:gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={cn(
              'relative flex h-11 w-11 items-center justify-center rounded-full transition-colors',
              isShuffle
                ? 'text-[#1ed760] after:content-["•"] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:text-[8px]'
                : 'text-[#b3b3b3] hover:text-white'
            )}
            title="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>

          {/* Previous */}
          <button
            onClick={previous}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#b3b3b3] transition-colors hover:scale-110 hover:text-white active:scale-95"
            title="Lagu sebelumnya"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlayPause}
            disabled={isFetchingId || isPlaybackUnavailable}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 md:h-9 md:w-9"
            title={isPlaybackUnavailable ? 'Playback belum tersedia' : isPlaying ? 'Pause' : 'Play'}
          >
            {isFetchingId ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 fill-black" />
            ) : (
              <Play className="h-4 w-4 fill-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#b3b3b3] transition-colors hover:scale-110 hover:text-white active:scale-95"
            title="Lagu berikutnya"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={() =>
              setRepeatMode(
                repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off'
              )
            }
            className={cn(
              'relative flex h-11 w-11 items-center justify-center rounded-full transition-colors',
              repeatMode !== 'off'
                ? 'text-[#1ed760] after:content-["•"] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:text-[8px]'
                : 'text-[#b3b3b3] hover:text-white'
            )}
            title="Repeat"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="h-4 w-4" />
            ) : (
              <Repeat className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full max-w-[520px] items-center gap-2">
          <span className="hidden w-8 text-right text-[11px] font-medium tabular-nums text-[#b3b3b3] sm:block">
            {formatTime(currentTime)}
          </span>
          <div className="group relative h-3 flex-1 cursor-pointer overflow-hidden rounded-full py-1">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#4d4d4d]" />
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white transition-colors group-hover:bg-[#1ed760]"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime || 0}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                setCurrentTime(time);
              }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ margin: 0 }}
            />
          </div>
          <span className="hidden w-8 text-[11px] font-medium tabular-nums text-[#b3b3b3] sm:block">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* ── Kanan: Volume + Tombol X ─────────────────────── */}
      <div className="hidden w-[30%] items-center justify-end gap-3 md:flex">
        {/* Volume */}
        <div className="flex items-center gap-2 w-28">
          <Volume2 className="h-4 w-4 text-[#b3b3b3] flex-shrink-0" />
          <div className="relative flex-1 h-1 bg-[#4d4d4d] rounded-full group cursor-pointer overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-white group-hover:bg-[#1ed760] rounded-full transition-colors"
              style={{ width: `${volume * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setVolumeState(vol);
                setVolume(vol);
              }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ margin: 0 }}
            />
          </div>
        </div>

        {/* Tombol X — Tutup / Stop Musik */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            stop();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-all"
          title="Tutup musik"
          aria-label="Tutup musik"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
