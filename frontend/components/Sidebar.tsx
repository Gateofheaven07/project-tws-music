'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar = ({ className, onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isQueueBuilderActive = pathname === '/queue-builder';

  // Daftar navigasi utama aplikasi
  const navItems = [
    { href: '/', label: 'Beranda', iconName: 'home' },
    { href: '/discover', label: 'Cari', iconName: 'search' },
    { href: '/playlists', label: 'Koleksi Kamu', iconName: 'library_music' },
    { href: '/favorites', label: 'Lagu yang Disukai', iconName: 'favorite' },
    { href: '/profile', label: 'Profil Saya', iconName: 'person' },
    { href: '/reviews', label: 'Beri Rating & Ulasan', iconName: 'rate_review' },
  ];

  return (
    <div className={cn('flex h-full min-h-0 w-64 flex-col gap-3 overflow-hidden bg-black p-4 text-text-secondary border-r border-border/20 sm:p-5', className)}>
      {/* Logo aplikasi */}
      <Link href="/" onClick={onNavigate} className="flex min-h-11 shrink-0 items-center gap-3 hover:opacity-80 transition-opacity">
        <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
        <div className="flex flex-col">
          <span className="text-[18px] font-bold text-primary leading-[1.3]">Soundwave</span>
          <span className="text-[10px] text-text-secondary uppercase">Premium Audio</span>
        </div>
      </Link>

      {/* Navigasi utama */}
      <nav className="flex min-h-0 flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex min-h-11 items-center gap-4 rounded-md px-1 py-1.5 transition-all duration-200 group',
                isActive
                  ? 'text-foreground font-bold'
                  : 'text-text-secondary hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[24px] transition-colors",
                  isActive ? "text-foreground" : "group-hover:text-foreground"
                )}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.iconName}
              </span>
              <span className="text-[14px]">{item.label}</span>
            </Link>
          );
        })}

        {/* Jalur cepat untuk menyusun antrean sendiri. */}
        <Link
          href="/queue-builder"
          onClick={onNavigate}
          className={cn(
            'mt-3 flex min-h-11 w-full items-center gap-2 rounded-full px-4 py-2 text-left text-[12px] font-bold uppercase tracking-[1px] shadow-sm transition-colors',
            isQueueBuilderActive
              ? 'bg-primary text-black'
              : 'bg-[#1F1F1F] text-foreground hover:bg-[#252525]'
          )}
        >
          <span
            className={cn(
              'material-symbols-outlined text-[20px]',
              isQueueBuilderActive ? 'text-black' : 'text-primary'
            )}
          >
            add
          </span>
          BUAT DAFTAR PUTAR
        </Link>
      </nav>

      {/* Bagian bawah: info user + tombol logout */}
      {user ? (
        <div className="shrink-0 border-t border-surface-container pt-3">
          {/* Kartu user — klik untuk ke halaman profil */}
          <Link
            href="/profile"
            onClick={onNavigate}
            className="mb-3 flex min-h-14 items-center gap-3 rounded-lg bg-surface-container p-3 shadow-md hover:bg-[#2a2a2a] transition-colors group"
          >
            {/* Avatar: tampilkan foto profil kalau ada, kalau nggak pakai inisial */}
            <div className="h-10 w-10 rounded-full overflow-hidden bg-spotify-green flex items-center justify-center text-black font-bold shadow-lg shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`Foto profil ${user.username}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.username[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                {user.username}
              </p>
              <p className="truncate text-xs text-text-secondary">{user.email}</p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:text-foreground transition-colors">
              chevron_right
            </span>
          </Link>

          {/* Tombol logout */}
          <button
            onClick={() => {
              logout();
              onNavigate?.();
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-1 py-2 text-destructive hover:text-foreground transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm uppercase tracking-[1.4px] font-bold">Logout</span>
          </button>
        </div>
      ) : (
        <div className="shrink-0 border-t border-surface-container pt-3">
          <Link
            href="/login"
            onClick={onNavigate}
            className="btn-pill block w-full bg-foreground text-black text-center hover:scale-105 transition-transform"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export const MobileSidebarButton = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(20rem,calc(100vw-2rem))] border-white/10 bg-black p-0"
      >
        <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
        <SheetDescription className="sr-only">
          Navigasi utama SoundWave untuk perangkat mobile.
        </SheetDescription>
        <SheetClose asChild>
          <Sidebar className="h-full w-full border-r-0" />
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};
