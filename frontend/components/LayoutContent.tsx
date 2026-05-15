'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { PlayerBar } from '@/components/PlayerBar';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { useAuth } from '@/hooks/useAuth';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isLandingPage = pathname === '/' && !user;

  if (isAuthPage || isLandingPage) {
    return <div className="flex-1 overflow-auto">{children}</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/*
        YouTubePlayer ada di sini, di level layout global, bukan di dalam PlayerBar.
        Tujuannya supaya player tidak pernah di-unmount meski kondisi UI berubah.
        Kalau dinaruh di PlayerBar yang bersyarat, player akan hancur tiap lagu ganti.
      */}
      <YouTubePlayer />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Global */}
        <div className="w-64 flex-shrink-0 hidden md:block">
          <Sidebar />
        </div>
        
        {/* Area Konten Utama */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
      
      {/* Player Bar Global */}
      <PlayerBar />
    </div>
  );
}
