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
    <header className="h-16 bg-background/80 backdrop-blur-lg sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        {/* Search Bar */}
        <div className={cn(
          'flex items-center gap-3 w-full max-w-[360px] rounded-full bg-surface-interactive px-4 py-2 transition-all group border border-transparent shadow-md',
          isSearchFocused && 'border-foreground bg-surface-container'
        )}>
          <Search className={cn(
            "h-5 w-5 transition-colors",
            isSearchFocused ? "text-foreground" : "text-text-secondary"
          )} />
          <input
            type="text"
            placeholder="Apa yang ingin kamu dengarkan?"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent outline-none text-[14px] text-foreground placeholder-text-secondary/50 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Title for section could be here, but usually it's breadcrumbs or just empty in Spotify */}
        <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
      </div>
    </header>
  );
};
