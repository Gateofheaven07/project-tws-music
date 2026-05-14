'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useMusic } from '@/hooks/useMusic';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title = 'SoundWave' }: HeaderProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { searchMusic, searchQuery, setSearchQuery } = useMusic();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      searchMusic(value);
    }
  };

  return (
    <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between w-full bg-background/80 backdrop-blur-md">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Apa yang ingin kamu dengar?"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-[#1F1F1F] text-foreground border-none rounded-full py-3 pl-[48px] pr-6 focus:ring-1 focus:ring-primary focus:bg-[#252525] transition-colors text-[16px] shadow-sm outline-none"
        />
      </div>

      <div className="flex items-center gap-6 ml-8">
        {/* Title for section could be here, but usually it's breadcrumbs or just empty in Spotify */}
        {title !== 'Cari' && (
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        )}
      </div>
    </header>
  );
};
