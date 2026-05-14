'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { PlayerBar } from '@/components/PlayerBar';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  if (isAuthPage) {
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
