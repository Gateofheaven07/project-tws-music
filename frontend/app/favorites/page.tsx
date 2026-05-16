'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SongTable } from '@/components/SongTable';
import { MobileSidebarButton } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { usePlayerStore } from '@/store/playerStore';

/**
 * Halaman "Lagu yang Disukai" - Hasil implementasi desain Google Stitch.
 * Fokus pada estetika premium "Obsidian Pulse" dengan header gradien ungu
 * yang dramatis dan daftar lagu dalam format tabel yang bersih.
 */
export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { favoriteSongs, isFavoritesLoading, getFavorites } = useMusic();
  const { startPlayback, isPlaying } = usePlayerStore();

  // Pastikan user login, kalau nggak langsung balikin ke login page
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    getFavorites();
  }, [user, router, getFavorites]);

  // Handler buat play semua lagu favorit sekaligus
  const handlePlayAll = () => {
    if (favoriteSongs.length > 0) {
      startPlayback(favoriteSongs, 0);
    }
  };

  // Jangan render apa-apa kalau belum ada user (tunggu redirect)
  if (!user) return null;

  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-background pb-36 md:pb-24 no-scrollbar animate-fade-in">
      
      {/* 
        Hero Header: Diperbarui agar identik dengan Google Stitch 
        Menggunakan gradien glow ungu halus di bagian atas.
      */}
      <header className="relative flex min-h-[300px] w-full items-end overflow-hidden p-4 pb-8 sm:p-6 md:min-h-[400px] md:p-10">
        {/* Glow ungu halus dari atas menyatu ke background hitam */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#450af54d] via-[#121212] to-background z-0"></div>
        <div className="absolute left-4 top-4 z-20 md:hidden">
          <MobileSidebarButton />
        </div>
        
        {/* Konten Header: Row flexbox yang responsif */}
        <div className="relative z-10 flex w-full flex-col items-center gap-5 pt-12 md:flex-row md:items-end md:gap-6 md:pt-0">
          
          {/* Kotak Ikon Playlist - Indigo ke Ungu Muda (135deg) */}
          <div className="flex h-36 w-36 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-[#450af5] to-[#8e8cf7] shadow-[0_30px_60px_rgba(0,0,0,0.5)] group sm:h-44 sm:w-44 md:h-60 md:w-60">
            <span className="material-symbols-outlined text-[82px] text-white opacity-90 sm:text-[100px] md:text-[140px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
              favorite
            </span>
          </div>

          {/* Info Detail Playlist */}
          <div className="flex flex-col gap-2 md:mb-1 text-center md:text-left">
            <span className="text-[12px] font-black uppercase tracking-[0.1em] text-white">Playlist</span>
            <h1 className="max-w-full break-words text-4xl font-extrabold leading-tight text-white drop-shadow-2xl sm:text-5xl md:text-[96px] md:leading-[0.95]">
              Lagu yang Disukai
            </h1>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-white md:mt-6 md:justify-start">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-black">
                {user.username[0].toUpperCase()}
              </div>
              <span className="hover:underline cursor-pointer">{user.username}</span>
              <span className="opacity-60">•</span>
              <span className="opacity-90">{favoriteSongs.length} lagu</span>
            </div>
          </div>
        </div>
      </header>

      {/* Bagian Aksi Utama: Tombol Play & Kontrol lainnya */}
      <section className="relative z-10 flex items-center gap-4 px-4 py-5 sm:px-6 md:px-10 md:py-6">
        <button 
          onClick={handlePlayAll}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1ed760] shadow-lg transition-all hover:scale-105 active:scale-95 md:h-16 md:w-16 group"
        >
          <span className="material-symbols-outlined text-black text-3xl md:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>
        
        <button className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/10 hover:text-white">
          <span className="material-symbols-outlined text-3xl">add_circle</span>
        </button>
        
        <button className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/10 hover:text-white">
          <span className="material-symbols-outlined text-3xl">more_horiz</span>
        </button>
      </section>

      {/* Konten Utama: Tabel Daftar Lagu */}
      <main className="flex-1 px-3 py-4 sm:px-4 md:px-6">
        {isFavoritesLoading ? (
          // Loading state yang estetik
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : favoriteSongs.length > 0 ? (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <SongTable songs={favoriteSongs} />
          </div>
        ) : (
          // Empty State kalau belum ada lagu yang disuka
          <div className="flex flex-col items-center justify-center py-20 text-center gap-6 opacity-60">
            <div className="w-28 h-28 rounded-full bg-surface-container flex items-center justify-center sm:h-32 sm:w-32">
              <span className="material-symbols-outlined text-7xl text-text-secondary/20">library_music</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">Koleksi favoritmu masih kosong</h3>
              <p className="text-text-secondary mt-2 max-w-sm mx-auto">
                Lagu-lagu yang kamu sukai akan muncul di sini secara otomatis. 
                Ayo cari musik baru dan klik ikon hati!
              </p>
            </div>
            <Link
              href="/discover"
              className="mt-4 px-10 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform shadow-xl uppercase tracking-widest text-xs"
            >
              Jelajahi Sekarang
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
