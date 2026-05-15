'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Play, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useMusicStore } from '@/store/musicStore';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { SongContextMenu } from '@/components/SongContextMenu';
import { cn } from '@/lib/utils';
import type { Song } from '@/store/playerStore';

interface MusicCardProps {
  song: Song;
  isCompact?: boolean;
  playQueue?: Song[];
  queueIndex?: number;
}

export const MusicCard = ({ song, isCompact = false, playQueue, queueIndex }: MusicCardProps) => {
  const { startPlayback } = usePlayerStore();
  const { favoriteSongs } = useMusicStore();
  const { user } = useAuth();
  const { addFavorite, removeFavorite } = useMusic();

  // Posisi menu tiga titik disimpan supaya bisa dirender di luar kartu.
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const isFavorited = favoriteSongs.some((s) => s.musicId === song.musicId);
  const isPlaybackUnavailable = song.playback?.status === 'unavailable';
  const unavailableMessage = song.playback?.errorReason === 'youtube_quota_exceeded'
    ? 'Playback belum tersedia karena quota YouTube habis.'
    : 'Playback belum tersedia.';

  const handlePlayClick = () => {
    if (isPlaybackUnavailable) return;

    const queue = playQueue?.length ? playQueue : [song];
    const index =
      typeof queueIndex === 'number'
        ? queueIndex
        : Math.max(
            queue.findIndex((queueSong) => queueSong.musicId === song.musicId),
            0
          );

    startPlayback(queue, index);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (isFavorited) {
      removeFavorite(song.musicId);
    } else {
      addFavorite(song);
    }
  };

  // Buka menu tepat di bawah tombol yang diklik.
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom + 4 });
  };

  if (isCompact) {
    return (
      <>
        <div
          onClick={handlePlayClick}
          className={cn(
            'flex items-center gap-4 rounded-md p-2 hover:bg-surface-elevated transition-colors group animate-fade-in',
            isPlaybackUnavailable ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
          )}
        >
          <div className="relative h-12 w-12 flex-shrink-0 rounded bg-surface-interactive overflow-hidden shadow-md">
            {song.album.cover.medium ? (
              <Image
                src={song.album.cover.medium}
                alt={song.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-full w-full bg-[#1f1f1f]" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayClick();
              }}
              disabled={isPlaybackUnavailable}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
              title={isPlaybackUnavailable ? unavailableMessage : 'Putar lagu'}
            >
              <Play className="h-5 w-5 text-white fill-white" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-bold text-sm text-foreground group-hover:underline underline-offset-2">
              {song.title}
            </p>
            <p className="truncate text-[12px] text-text-secondary">{song.artist.name}</p>
            {isPlaybackUnavailable && (
              <p className="mt-0.5 truncate text-[11px] text-amber-300/90">
                {unavailableMessage}
              </p>
            )}
          </div>

          {/* Ikon 3 titik */}
          <button
            onClick={handleMoreClick}
            className="p-1.5 opacity-0 group-hover:opacity-100 transition-all text-text-secondary hover:text-foreground rounded-full hover:bg-white/10"
            title="Opsi lainnya"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <button
            onClick={handleFavoriteClick}
            className={cn(
              'p-2 opacity-0 group-hover:opacity-100 transition-all',
              isFavorited ? 'opacity-100 text-spotify-green' : 'text-text-secondary hover:text-foreground'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorited && 'fill-current')} />
          </button>
        </div>

        {/* Menu konteks */}
        {contextMenu && (
          <SongContextMenu
            song={song}
            position={contextMenu}
            onClose={() => setContextMenu(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        onClick={handlePlayClick}
        className={cn(
          'group relative rounded-lg bg-card p-4 hover:bg-surface-elevated transition-all duration-300 shadow-md animate-fade-in',
          isPlaybackUnavailable ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
        )}
      >
        {/* Cover lagu */}
        <div className="relative aspect-square overflow-hidden rounded-md bg-surface-interactive shadow-lg mb-4">
          {song.album.cover.big ? (
            <Image
              src={song.album.cover.big}
              alt={song.title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-full w-full bg-[#1f1f1f]" />
          )}

          {/* Tombol play melayang */}
          <div className="absolute right-2 bottom-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayClick();
              }}
              disabled={isPlaybackUnavailable}
              className="rounded-full bg-spotify-green p-3 text-black shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/50 disabled:hover:scale-100"
              title={isPlaybackUnavailable ? unavailableMessage : 'Putar lagu'}
            >
              <Play className="h-6 w-6 fill-black" />
            </button>
          </div>
        </div>

        {/* Info lagu */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-bold text-[16px] text-foreground leading-tight flex-1">
              {song.title}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Ikon tiga titik */}
              <button
                onClick={handleMoreClick}
                className="p-1 opacity-0 group-hover:opacity-100 transition-all text-text-secondary hover:text-foreground rounded-full hover:bg-white/10"
                title="Opsi lainnya"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  'transition-colors p-1',
                  isFavorited ? 'text-spotify-green' : 'text-text-secondary hover:text-foreground'
                )}
              >
                <Heart className={cn('h-4 w-4', isFavorited && 'fill-current')} />
              </button>
            </div>
          </div>
          <p className="truncate text-[14px] text-text-secondary">{song.artist.name}</p>
          {song.album.name && (
            <p className="truncate text-[12px] text-text-secondary/60">{song.album.name}</p>
          )}
          {isPlaybackUnavailable && (
            <p className="line-clamp-2 text-[12px] leading-4 text-amber-300/90">
              {unavailableMessage}
            </p>
          )}
        </div>
      </div>

      {/* Menu konteks */}
      {contextMenu && (
        <SongContextMenu
          song={song}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};
