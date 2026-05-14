'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { PlayerBar } from '@/components/PlayerBar';
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
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Global */}
        <div className="w-64 flex-shrink-0 hidden md:block">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
      
      {/* Player Bar Global */}
      <PlayerBar />
    </div>
  );
}
