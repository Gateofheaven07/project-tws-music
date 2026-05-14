'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Home, Search, ListMusic, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/discover', label: 'Discover', icon: Search },
    { href: '/playlists', label: 'Playlists', icon: ListMusic },
    { href: '/favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <div className="flex h-screen w-64 flex-col gap-4 bg-black p-6 text-text-secondary">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-4 text-spotify-green hover:opacity-80 transition-opacity">
        <Music className="h-8 w-8 text-spotify-green" />
        <span className="text-xl font-bold tracking-tight">SoundWave</span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 py-2 transition-all duration-200 group',
                isActive
                  ? 'text-foreground font-bold'
                  : 'hover:text-foreground'
              )}
            >
              <Icon className={cn(
                "h-6 w-6 transition-colors",
                isActive ? "text-foreground" : "group-hover:text-foreground"
              )} />
              <span className="text-[14px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {user ? (
        <div className="border-t border-surface-container pt-4">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-surface-container p-3 shadow-md">
            <div className="h-10 w-10 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold shadow-lg">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-bold text-sm text-foreground">{user.username}</p>
              <p className="truncate text-xs text-text-secondary">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 py-2 text-destructive hover:text-foreground transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm uppercase tracking-[1.4px] font-bold">Logout</span>
          </button>
        </div>
      ) : (
        <div className="border-t border-surface-container pt-4">
          <Link
            href="/login"
            className="btn-pill block w-full bg-foreground text-black text-center hover:scale-105 transition-transform"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};
