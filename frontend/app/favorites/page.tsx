'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SongTable } from '@/components/SongTable';
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
    <div className="flex-1 flex flex-col min-w-0 relative bg-background h-full overflow-y-auto pb-[140px] md:pb-[90px] no-scrollbar animate-fade-in">
      
      {/* 
        Hero Header: Diperbarui agar identik dengan Google Stitch 
        Menggunakan gradien glow ungu halus di bagian atas.
      */}
      <header className="relative w-full min-h-[340px] md:min-h-[400px] flex items-end p-6 md:p-10 pb-8 overflow-hidden">
        {/* Glow ungu halus dari atas menyatu ke background hitam */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#450af54d] via-[#121212] to-background z-0"></div>
        
        {/* Konten Header: Row flexbox yang responsif */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
          
          {/* Kotak Ikon Playlist - Indigo ke Ungu Muda (135deg) */}
          <div className="w-48 h-48 md:w-60 md:h-60 flex-shrink-0 bg-gradient-to-br from-[#450af5] to-[#8e8cf7] shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-sm flex items-center justify-center group overflow-hidden">
            <span className="material-symbols-outlined text-[100px] md:text-[140px] text-white opacity-90" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
              favorite
            </span>
          </div>

          {/* Info Detail Playlist */}
          <div className="flex flex-col gap-2 md:mb-1 text-center md:text-left">
            <span className="text-[12px] font-black uppercase tracking-[0.1em] text-white">Playlist</span>
            <h1 className="text-6xl md:text-[96px] font-extrabold text-white tracking-tighter leading-[0.95] drop-shadow-2xl">
              Lagu yang Disukai
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-6 text-white text-sm font-bold">
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
      <section className="px-6 md:px-10 py-6 flex items-center gap-8 relative z-10">
        <button 
          onClick={handlePlayAll}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1ed760] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group"
        >
          <span className="material-symbols-outlined text-black text-3xl md:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>
        
        <button className="text-text-secondary hover:text-white transition-colors">
          <span className="material-symbols-outlined text-3xl">add_circle</span>
        </button>
        
        <button className="text-text-secondary hover:text-white transition-colors">
          <span className="material-symbols-outlined text-3xl">more_horiz</span>
        </button>
      </section>

      {/* Konten Utama: Tabel Daftar Lagu */}
      <main className="px-2 md:px-6 py-4 flex-1">
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
            <div className="w-32 h-32 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-7xl text-text-secondary/20">library_music</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Koleksi favoritmu masih kosong</h3>
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
