'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { PlayerBar } from '@/components/PlayerBar';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { NowPlayingModal } from '@/components/NowPlayingModal';
import { useAuth } from '@/hooks/useAuth';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const publicMarketingPaths = ['/landing', '/tentang-kami', '/dukungan'];
  const isPublicMarketingPage = pathname ? publicMarketingPaths.includes(pathname) : false;
  const isLandingPage = pathname === '/' && !user;

  if (isAuthPage || isLandingPage || isPublicMarketingPage) {
    return <div className="min-h-dvh overflow-x-hidden">{children}</div>;
  }

  return (
    <div className="flex h-dvh min-h-dvh flex-col overflow-hidden">
      {/*
        YouTubePlayer ada di sini, di level layout global, bukan di dalam PlayerBar.
        Tujuannya supaya player tidak pernah di-unmount meski kondisi UI berubah.
      */}
      <YouTubePlayer />

      {/*
        NowPlayingModal — full screen player ala Spotify.
        Diletakkan di sini biar selalu tersedia dan tidak ter-unmount saat navigasi.
      */}
      <NowPlayingModal />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar Global */}
        <div className="hidden w-64 flex-shrink-0 md:block">
          <Sidebar />
        </div>
        
        {/* Area Konten Utama */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
      
      {/* Player Bar Global */}
      <PlayerBar />
    </div>
  );
}
