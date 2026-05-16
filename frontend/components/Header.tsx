'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useMusic } from '@/hooks/useMusic';
import { MobileSidebarButton } from '@/components/Sidebar';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title = 'SoundWave' }: HeaderProps) => {
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const { searchMusic, searchQuery, setSearchQuery, clearSearch } = useMusic();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setPendingQuery(null);
      clearSearch();
      return;
    }

    setPendingQuery(value);
  };

  useEffect(() => {
    if (pendingQuery === null) return;

    const timeoutId = window.setTimeout(() => {
      searchMusic(pendingQuery);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [pendingQuery, searchMusic]);

  return (
    <header className="sticky top-0 z-40 flex w-full items-center gap-3 bg-background/85 px-4 py-3 backdrop-blur-md sm:px-5 md:px-6 md:py-4">
      <MobileSidebarButton />

      <div className="relative min-w-0 flex-1 md:max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Apa yang ingin kamu dengar?"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-12 w-full rounded-full border-none bg-[#1F1F1F] py-3 pl-[48px] pr-4 text-[16px] text-foreground shadow-sm outline-none transition-colors placeholder:truncate focus:bg-[#252525] focus:ring-1 focus:ring-primary sm:pr-6"
        />
      </div>

      <div className="hidden items-center gap-6 md:ml-8 md:flex">
        {/* Title for section could be here, but usually it's breadcrumbs or just empty in Spotify */}
        {title !== 'Cari' && (
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        )}
      </div>
    </header>
  );
};
