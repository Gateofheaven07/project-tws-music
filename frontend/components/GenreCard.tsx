'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Genre } from '@/store/musicStore';

interface GenreCardProps {
  genre: Genre;
  variant?: 'wide' | 'square';
  href?: string;
  className?: string;
  onClick?: (genre: Genre) => void;
}

export const GenreCard = ({
  genre,
  variant = 'square',
  href,
  className,
  onClick,
}: GenreCardProps) => {
  const imageUrl = genre.pictureBig || genre.pictureMedium || genre.picture || genre.pictureSmall;
  const label = `Cari musik ${genre.name}`;

  const content =
    variant === 'wide' ? (
      <>
        <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[#181818] md:h-20 md:w-20">
          {imageUrl ? (
            <Image src={imageUrl} alt={genre.name} fill sizes="80px" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-[#1f1f1f]" />
          )}
        </div>
        <span className="min-w-0 flex-1 truncate px-3 text-[16px] font-bold text-white md:px-4">
          {genre.name}
        </span>
        <span className="mr-3 flex h-10 w-10 shrink-0 translate-y-2 items-center justify-center rounded-full bg-[#1ed760] text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Search className="h-5 w-5" aria-hidden="true" />
        </span>
      </>
    ) : (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f7a53] via-[#24555f] to-[#31214a] opacity-95 transition-opacity group-hover:opacity-100" />
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            width={160}
            height={160}
            sizes="(max-width: 768px) 45vw, 220px"
            className="absolute -bottom-5 -right-5 h-2/3 w-2/3 rotate-[25deg] rounded object-cover shadow-xl transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-105"
          />
        )}
        <h3 className="relative z-10 pr-4 text-[18px] font-bold leading-tight text-white drop-shadow-md">
          {genre.name}
        </h3>
      </>
    );

  const classes = cn(
    variant === 'wide'
      ? 'group flex min-h-14 items-center overflow-hidden rounded-md bg-[#292a2a] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:bg-[#252525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:min-h-20'
      : 'group relative block aspect-square overflow-hidden rounded-lg p-4 text-left shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={() => onClick?.(genre)} aria-label={label}>
      {content}
    </button>
  );
};
