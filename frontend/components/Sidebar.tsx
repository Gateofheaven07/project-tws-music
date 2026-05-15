'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Daftar navigasi utama aplikasi
  const navItems = [
    { href: '/', label: 'Beranda', iconName: 'home' },
    { href: '/discover', label: 'Cari', iconName: 'search' },
    { href: '/playlists', label: 'Koleksi Kamu', iconName: 'library_music' },
    { href: '/favorites', label: 'Lagu yang Disukai', iconName: 'favorite' },
    { href: '/profile', label: 'Profil Saya', iconName: 'person' },
  ];

  return (
    <div className="flex h-screen w-64 flex-col gap-4 bg-black p-6 text-text-secondary border-r border-border/20">
      {/* Logo aplikasi */}
      <Link href="/" className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
        <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
        <div className="flex flex-col">
          <span className="text-[18px] font-bold text-primary leading-[1.3]">Soundwave</span>
          <span className="text-[10px] text-text-secondary uppercase">Premium Audio</span>
        </div>
      </Link>

      {/* Navigasi utama */}
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 py-2 transition-all duration-200 group',
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

        {/* Tombol buat playlist */}
        <button className="mt-4 bg-[#1F1F1F] text-foreground text-[12px] font-bold tracking-[1px] py-[6px] px-4 rounded-full hover:bg-[#252525] transition-colors text-left flex items-center gap-2 w-full shadow-sm uppercase">
          <span className="material-symbols-outlined text-primary text-[20px]">add</span>
          BUAT DAFTAR PUTAR
        </button>
      </nav>

      {/* Bagian bawah: info user + tombol logout */}
      {user ? (
        <div className="border-t border-surface-container pt-4">
          {/* Kartu user — klik untuk ke halaman profil */}
          <Link
            href="/profile"
            className="mb-4 flex items-center gap-3 rounded-lg bg-surface-container p-3 shadow-md hover:bg-[#2a2a2a] transition-colors group"
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
