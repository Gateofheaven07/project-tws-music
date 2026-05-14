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

  const isFavorited = favoriteSongs.some((s) => s.id === song.id);

  const handlePlayClick = () => {
    setQueue([song]);
    setCurrentSongIndex(0);
    play();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (isFavorited) {
      removeFavorite(song.id);
    } else {
      addFavorite(song);
    }
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors group cursor-pointer">
        <div className="relative h-12 w-12 flex-shrink-0 rounded bg-muted overflow-hidden">
          {song.thumbnail ? (
            <Image
              src={song.thumbnail}
              alt={song.title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10" />
          )}
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="h-5 w-5 text-white fill-white" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-semibold text-sm text-foreground">{song.title}</p>
          <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-lg bg-card hover:shadow-lg transition-all hover:bg-card/80">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {song.thumbnail ? (
          <Image
            src={song.thumbnail}
            alt={song.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/10" />
        )}

        {/* Overlay with play button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePlayClick}
            className="rounded-full bg-primary p-4 text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Play className="h-6 w-6 fill-current" />
          </button>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            'absolute right-2 top-2 rounded-full p-2 transition-all',
            isFavorited
              ? 'bg-primary text-primary-foreground'
              : 'bg-black/40 text-white hover:bg-black/60'
          )}
        >
          <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
          {song.title}
        </p>
        <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
        {song.album && (
          <p className="truncate text-xs text-muted-foreground/70 mt-1">{song.album}</p>
        )}
      </div>
    </div>
  );
};
