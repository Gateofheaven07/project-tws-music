'use client';

import Image from 'next/image';
import { Heart, Play } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useMusicStore } from '@/store/musicStore';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { cn } from '@/lib/utils';
import type { Song } from '@/store/playerStore';

interface MusicCardProps {
  song: Song;
  isCompact?: boolean;
}

export const MusicCard = ({ song, isCompact = false }: MusicCardProps) => {
  const { setQueue, setCurrentSongIndex, play } = usePlayerStore();
  const { favoriteSongs } = useMusicStore();
  const { user } = useAuth();
  const { addFavorite, removeFavorite } = useMusic();

  const isFavorited = favoriteSongs.some((s) => s.musicId === song.musicId);

  const handlePlayClick = () => {
    setQueue([song]);
    setCurrentSongIndex(0);
    play();
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

  if (isCompact) {
    return (
      <div className="flex items-center gap-4 rounded-md p-2 hover:bg-surface-elevated transition-colors group cursor-pointer animate-fade-in">
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
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="h-5 w-5 text-white fill-white" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-bold text-sm text-foreground group-hover:underline underline-offset-2">{song.title}</p>
          <p className="truncate text-[12px] text-text-secondary">{song.artist.name}</p>
        </div>
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "p-2 opacity-0 group-hover:opacity-100 transition-all",
            isFavorited ? "opacity-100 text-spotify-green" : "text-text-secondary hover:text-foreground"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg bg-card p-4 hover:bg-surface-elevated transition-all duration-300 shadow-md animate-fade-in cursor-pointer">
      {/* Image Container */}
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

        {/* Play Button (Spotify Style - Floating on bottom right) */}
        <div className="absolute right-2 bottom-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayClick();
            }}
            className="rounded-full bg-spotify-green p-3 text-black shadow-2xl hover:scale-105 active:scale-95 transition-transform"
          >
            <Play className="h-6 w-6 fill-black" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-bold text-[16px] text-foreground leading-tight flex-1">
            {song.title}
          </p>
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "transition-colors",
              isFavorited ? "text-spotify-green" : "text-text-secondary hover:text-foreground"
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
          </button>
        </div>
        <p className="truncate text-[14px] text-text-secondary">{song.artist.name}</p>
        {song.album.name && (
          <p className="truncate text-[12px] text-text-secondary/60">{song.album.name}</p>
        )}
      </div>
    </div>
  );
};
