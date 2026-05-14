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
    <div className="flex h-screen flex-col gap-4 border-r border-border bg-sidebar p-6 text-sidebar-foreground">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
        <Music className="h-6 w-6" />
        <span>SoundWave</span>
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
                'flex items-center gap-3 rounded-lg px-4 py-2 transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {user ? (
        <div className="border-t border-sidebar-border pt-4">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-sidebar-accent/10 p-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-sidebar-accent-foreground font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-sm">{user.username}</p>
              <p className="truncate text-xs text-sidebar-foreground/70">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="border-t border-sidebar-border pt-4">
          <Link
            href="/login"
            className="block w-full rounded-lg bg-primary px-4 py-2 text-center font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};
