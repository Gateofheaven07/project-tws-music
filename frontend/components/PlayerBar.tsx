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
import api from '@/lib/api';
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
        console.error('Gagal ngambil video ID:', error);
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
    <div className="h-[90px] bg-black border-t border-[#282828] px-4 flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 shadow-2xl">

      {/* ── Kiri: Info Lagu (klik untuk buka full player) ─── */}
      <div
        className="flex items-center gap-4 w-[30%] min-w-[180px] cursor-pointer group"
        onClick={() => setShowNowPlaying(true)}
        title="Buka player penuh"
      >
        {/* Album Cover */}
        <div className="relative h-14 w-14 flex-shrink-0 rounded-[4px] bg-[#181818] overflow-hidden shadow-lg">
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
        <div className="flex-1 min-w-0">
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
            'transition-colors p-2 flex-shrink-0',
            isFavorited ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
          )}
          title={isFavorited ? 'Hapus dari Liked Songs' : 'Tambah ke Liked Songs'}
        >
          <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
        </button>
      </div>

      {/* ── Tengah: Kontrol & Progress Bar ──────────────── */}
      <div className="flex flex-col items-center max-w-[40%] w-full gap-2">
        {/* Tombol Kontrol */}
        <div className="flex items-center gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={cn(
              'transition-colors relative',
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
            className="text-[#b3b3b3] hover:text-white transition-colors hover:scale-110 active:scale-95"
            title="Lagu sebelumnya"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlayPause}
            disabled={isFetchingId || isPlaybackUnavailable}
            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
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
            className="text-[#b3b3b3] hover:text-white transition-colors hover:scale-110 active:scale-95"
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
              'transition-colors relative',
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
        <div className="flex items-center gap-2 w-full max-w-[450px]">
          <span className="text-[11px] text-[#b3b3b3] w-8 text-right font-medium tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 h-1 bg-[#4d4d4d] rounded-full group cursor-pointer overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-white group-hover:bg-[#1ed760] rounded-full transition-colors"
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
          <span className="text-[11px] text-[#b3b3b3] w-8 font-medium tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* ── Kanan: Volume + Tombol X ─────────────────────── */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
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
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
