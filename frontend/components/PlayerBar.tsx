'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Heart, Loader } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useMusicStore } from '@/store/musicStore';
import { useMusic } from '@/hooks/useMusic';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Song } from '@/store/playerStore';

/**
 * Bar Player di bagian bawah. Ini pusat kontrol musik kita.
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
    togglePlayPause,
    setCurrentTime,
    setDuration,
    setVolume,
    next,
    previous,
    setRepeatMode,
    toggleShuffle,
  } = usePlayerStore();

  const { favoriteSongs } = useMusicStore();
  const { addFavorite, removeFavorite } = useMusic();

  const isFavorited = currentSong && favoriteSongs.some((s) => s.musicId === currentSong.musicId);

  // Efek buat nyari Video ID YouTube tiap kali lagu aktif berganti.
  // Kita hanya fetch kalau lagu belum punya videoId (artinya belum siap diputar).
  useEffect(() => {
    const fetchVideoId = async () => {
      // Kalau tidak ada lagu, atau videoId sudah ada, langsung skip — tidak perlu fetch lagi.
      if (!currentSong || currentSong.playback?.videoId) return;

      setIsFetchingId(true);
      try {
        const response = await api.get('/music/stream-id', {
          params: {
            // Kirim nama artis sebagai string, bukan objek.
            // Struktur data lagu kita menyimpan artis dalam `artist.name`.
            artist: currentSong.artist.name,
            title: currentSong.title,
          },
        });

        const videoId = response.data?.data?.videoId;
        if (videoId) {
          // Buat objek lagu yang sudah diperbarui dengan videoId baru,
          // lalu update queue di store supaya perubahannya reaktif dan tidak mutasi state langsung.
          const updatedSong: Song = {
            ...currentSong,
            playback: {
              ...currentSong.playback,
              videoId,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
              youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
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
            // begitu videoId tersedia.
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

  // YouTubePlayer dikelola di LayoutContent (level layout global),
  // bukan di sini, supaya player tidak hancur ketika currentSong null.
  if (!currentSong) return null;

  return (
    <>

      <div className="h-[90px] bg-black border-t border-[#121212] px-4 flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
        {/* Left: Now Playing Info (30% width approx) */}
        <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
          <div className="relative h-14 w-14 flex-shrink-0 rounded-[4px] bg-[#181818] overflow-hidden shadow-lg group">
            {currentSong.album.cover.small ? (
              <Image
                src={currentSong.album.cover.small}
                alt={currentSong.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-full w-full bg-[#181818]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate font-bold text-[14px] text-[#ffffff] hover:underline cursor-pointer">{currentSong.title}</p>
            <p className="truncate text-[11px] text-[#b3b3b3] hover:text-[#ffffff] hover:underline cursor-pointer">{currentSong.artist.name}</p>
          </div>

          <button
            onClick={() => {
              if (isFavorited) {
                removeFavorite(currentSong.musicId);
              } else {
                addFavorite(currentSong);
              }
            }}
            className={cn(
              'transition-colors p-2',
              isFavorited ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-[#ffffff]'
            )}
          >
            <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
          </button>
        </div>

        {/* Center: Controls & Progress (40% width approx) */}
        <div className="flex flex-col items-center max-w-[40%] w-full gap-2">
          {/* Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={cn(
                'transition-colors',
                isShuffle ? 'text-[#1ed760] relative after:content-["•"] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:text-[8px]' : 'text-[#b3b3b3] hover:text-[#ffffff]'
              )}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              onClick={previous}
              className="text-[#b3b3b3] hover:text-[#ffffff] transition-colors"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={isFetchingId}
              className="h-8 w-8 rounded-full bg-[#ffffff] flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isFetchingId ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 fill-black" />
              ) : (
                <Play className="h-5 w-5 fill-black ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              className="text-[#b3b3b3] hover:text-[#ffffff] transition-colors"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
            <button
              onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
              className={cn(
                'transition-colors',
                repeatMode !== 'off' ? 'text-[#1ed760] relative after:content-["•"] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:text-[8px]' : 'text-[#b3b3b3] hover:text-[#ffffff]'
              )}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full max-w-[450px]">
            <span className="text-[11px] text-[#b3b3b3] w-8 text-right font-medium">{formatTime(currentTime)}</span>
            <div className="relative flex-1 group">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime || 0}
                onChange={(e) => {
                  const time = parseFloat(e.target.value);
                  setCurrentTime(time);
                }}
                className="w-full h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-[#1ed760] hover:accent-[#1db954]"
              />
              {/* Optional: Visual progress highlight for custom styling if needed */}
            </div>
            <span className="text-[11px] text-[#b3b3b3] w-8 font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Extra (30% width approx) */}
        <div className="flex items-center justify-end gap-3 w-[30%]">
          <div className="flex items-center gap-2 w-32">
            <Volume2 className="h-5 w-5 text-[#b3b3b3]" />
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
              className="flex-1 h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-[#ffffff] hover:accent-[#1ed760]"
            />
          </div>
        </div>
      </div>
    </>
  );
};
