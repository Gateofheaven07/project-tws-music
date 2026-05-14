'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Heart, Loader } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useMusicStore } from '@/store/musicStore';
import { useMusic } from '@/hooks/useMusic';
import { cn } from '@/lib/utils';
import { YouTubePlayer } from './YouTubePlayer';
import api from '@/lib/api';

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

  const isFavorited = currentSong && favoriteSongs.some((s) => s.id === currentSong.id);

  // Efek buat nyari Video ID YouTube pas lagu ganti
  useEffect(() => {
    const fetchVideoId = async () => {
      if (!currentSong || currentSong.youtubeUrl) return;

      setIsFetchingId(true);
      try {
        const response = await api.get('/music/stream-id', {
          params: {
            artist: currentSong.artist,
            title: currentSong.title,
          },
        });

        if (response.data.data.videoId) {
          // Update song di store dengan videoId
          // Kita asumsikan youtubeUrl di store itu nyimpen videoId
          currentSong.youtubeUrl = response.data.data.videoId;
        }
      } catch (error) {
        console.error('Gagal ngambil video ID:', error);
      } finally {
        setIsFetchingId(false);
      }
    };

    fetchVideoId();
  }, [currentSong]);

  // Format waktu (detik ke mm:ss)
  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <>
      <YouTubePlayer />

      <div className="border-t border-border bg-card px-6 py-4">
        {/* Now Playing Info */}
        <div className="mb-4 flex items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 rounded bg-muted overflow-hidden">
            {currentSong.thumbnail ? (
              <Image
                src={currentSong.thumbnail}
                alt={currentSong.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate font-semibold text-foreground">{currentSong.title}</p>
            <p className="truncate text-sm text-muted-foreground">{currentSong.artist}</p>
          </div>

          <button
            onClick={() => {
              if (isFavorited) {
                removeFavorite(currentSong.id);
              } else {
                addFavorite(currentSong);
              }
            }}
            className={cn(
              'rounded-full p-2 transition-colors',
              isFavorited
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime || 0}
            onChange={(e) => {
              const time = parseFloat(e.target.value);
              setCurrentTime(time);
              // Untuk seek YouTube, kita butuh akses ke player-nya.
              // Kita bisa tambahin action seek di store.
            }}
            className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
          <span className="text-xs text-muted-foreground w-8">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
              className={cn(
                'rounded p-2 transition-colors',
                repeatMode !== 'off'
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="h-5 w-5" />
            </button>
            <button
              onClick={toggleShuffle}
              className={cn(
                'rounded p-2 transition-colors',
                isShuffle
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Shuffle"
            >
              <Shuffle className="h-5 w-5" />
            </button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={previous}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Previous"
            >
              <SkipBack className="h-6 w-6" />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={isFetchingId}
              className="rounded-full bg-primary p-3 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isFetchingId ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Next"
            >
              <SkipForward className="h-6 w-6" />
            </button>
          </div>

          {/* Right Controls - Volume */}
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
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
              className="w-24 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              title="Volume"
            />
          </div>
        </div>
      </div>
    </>
  );
};
