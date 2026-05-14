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
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex h-20 items-center justify-between gap-4 px-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>

        {/* Search Bar */}
        <div className={cn(
          'flex items-center gap-2 rounded-full bg-muted px-4 py-2 transition-all',
          isSearchFocused && 'ring-2 ring-primary'
        )}>
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search songs, artists..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>
    </header>
  );
};
