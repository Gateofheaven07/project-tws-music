'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  BarChart3,
  Server,
  LogOut,
  Music,
  ChevronLeft,
  Menu,
  X,
  Shield,
  ShieldCheck,
} from 'lucide-react';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/system', label: 'System', icon: Server, superAdminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Route guard: redirect non-admin users
  useEffect(() => {
    if (mounted && user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.replace('/');
    }
  }, [mounted, user, router]);

  // Belum mount atau belum login → loading
  if (!mounted || !user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-[#b3b3b3]">Memuat panel admin...</p>
        </div>
      </div>
    );
  }

  // Bukan admin → jangan render apa-apa (akan redirect)
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return null;
  }

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const visibleNav = adminNavItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  const roleBadge = isSuperAdmin ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
      <ShieldCheck className="h-3 w-3" />
      Super Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
      <Shield className="h-3 w-3" />
      Admin
    </span>
  );

  return (
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-[#0a0a0a]">
      {/* ─── Sidebar Desktop ─── */}
      <aside className="hidden w-[260px] flex-shrink-0 flex-col border-r border-white/[0.06] bg-[#0f0f0f] md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
          <span
            className="material-symbols-outlined text-[22px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            graphic_eq
          </span>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-white leading-tight">SoundWave</span>
            <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-primary/70">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {visibleNav.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-[#888] hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive ? 'text-primary' : 'text-[#666] group-hover:text-[#aaa]'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/[0.06] p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#888] transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <Music className="h-[18px] w-[18px] text-[#666]" />
            Ke SoundWave App
          </Link>

          {/* User Card */}
          <div className="mt-2 flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[12px] font-bold text-primary">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white">{user.username}</p>
              {roleBadge}
            </div>
            <button
              onClick={() => { logout(); router.replace('/login'); }}
              className="rounded-md p-1.5 text-[#666] transition-colors hover:bg-white/[0.06] hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Header + Menu ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0f0f0f] px-4 md:hidden">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[20px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              graphic_eq
            </span>
            <span className="text-[14px] font-bold text-white">SoundWave Admin</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#888] transition-colors hover:bg-white/[0.06]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Overlay Nav */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md md:hidden">
            <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
              <span className="text-[14px] font-bold text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-[#888] hover:bg-white/[0.06]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {visibleNav.map((item) => {
                const isActive = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-medium transition-colors',
                      isActive ? 'bg-white/[0.08] text-white' : 'text-[#888] hover:text-white'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-[#666]')} />
                    {item.label}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-white/[0.06]" />
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-medium text-[#888] hover:text-white"
              >
                <Music className="h-5 w-5 text-[#666]" />
                Ke SoundWave App
              </Link>
            </nav>
          </div>
        )}

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
