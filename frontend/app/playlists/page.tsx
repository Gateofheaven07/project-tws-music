'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import Link from 'next/link';

// Definisi tipe data Playlist biar TypeScript gak rewel
interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs?: any[];
}

/**
 * Halaman "Koleksi Kamu" - Fokus ke Playlist buatan user.
 * Di sini user bisa liat daftar playlist mereka dan bikin yang baru.
 * Desain pake gaya "Obsidian Pulse" yang gelap, elegan, dan premium.
 */
export default function PlaylistsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  
  // State buat nyimpen data playlist dan status loading
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab yang lagi aktif (Playlist, Artis, atau Album)
  const [activeTab, setActiveTab] = useState('Playlist');

  // Ambil data playlist dari server pas halaman dibuka
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const loadPlaylists = async () => {
      if (!accessToken) return;
      setIsLoading(true);
      try {
        const response = await api.get('/playlists');
        // Kita ambil hasil dari field 'results' sesuai format API
        setPlaylists(response.data.results || []);
      } catch (error) {
        console.error('Duh, gagal ngambil playlist kamu nih:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylists();
  }, [user, router, accessToken]);

  // Fungsi buat bikin playlist baru secara instan
  const handleCreatePlaylist = async () => {
    try {
      const name = `Playlist Baru #${playlists.length + 1}`;
      const response = await api.post('/playlists', {
        name,
        description: 'Playlist baru yang dibuat dengan penuh cinta.',
        isPublic: false
      });
      
      if (response.data.success) {
        // Kalo berhasil, langsung tambahin ke state biar gak perlu reload halaman
        setPlaylists([response.data.results, ...playlists]);
      }
    } catch (error) {
      console.error('Gagal bikin playlist baru:', error);
      alert('Maaf ya, gagal bikin playlist nih. Coba lagi nanti!');
    }
  };

  // Kalo user belum login, mending kosongin aja dulu sambil nunggu redirect
  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0 relative bg-background h-full overflow-y-auto pb-[140px] md:pb-[90px] animate-fade-in">
      
      {/* Header Premium dengan efek Blur (Sticky) */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl pt-8 pb-4 px-6 md:px-10 border-b border-transparent shadow-[0_4px_30px_rgba(0,0,0,0.3)] flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-interactive flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-colors md:hidden">
              <span className="material-symbols-outlined">menu</span>
            </div>
            <h2 className="font-bold text-2xl md:text-3xl tracking-tight">Koleksi Kamu</h2>
          </div>
          
          {/* Avatar User dengan aksen hijau Soundwave */}
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer ml-sm bg-surface-interactive flex items-center justify-center text-primary font-bold shadow-lg">
            {user.username[0].toUpperCase()}
          </div>
        </div>

        {/* Navigasi Tab Koleksi */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['Playlist', 'Artis', 'Album'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap border transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(30,215,96,0.4)]' 
                  : 'bg-surface-interactive hover:bg-surface-bright text-text-primary border-transparent hover:border-border'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 flex-1">
        {isLoading ? (
          // Spinner cantik pas nunggu data
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(30,215,96,0.2)]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            
            {/* Kartu Spesial: Buat Playlist Baru */}
            {activeTab === 'Playlist' && (
              <div 
                onClick={handleCreatePlaylist}
                className="card-container bg-surface-container/20 border-2 border-dashed border-border/30 hover:border-primary/50 p-4 rounded-[1.2rem] cursor-pointer transition-all duration-300 relative group flex flex-col gap-3 items-center justify-center aspect-square h-full min-h-[180px]"
              >
                <div className="w-16 h-16 rounded-full bg-surface-interactive flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:rotate-90">
                  <span className="material-symbols-outlined text-4xl font-bold">add</span>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">Buat Playlist</h4>
                  <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mt-1">Mulai koleksi baru</p>
                </div>
              </div>
            )}

            {/* List Playlist yang udah ada */}
            {activeTab === 'Playlist' && playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlists/${playlist.id}`}
                className="card-container bg-surface-container/40 hover:bg-surface-elevated p-4 rounded-[1.2rem] cursor-pointer transition-all duration-300 relative group flex flex-col gap-3 border border-transparent hover:border-white/10 shadow-lg"
              >
                <div className="relative w-full aspect-square rounded-[0.8rem] overflow-hidden shadow-inner bg-surface-variant flex items-center justify-center group-hover:shadow-2xl transition-all">
                  {/* Ikon default buat cover playlist */}
                  <span className="material-symbols-outlined text-6xl text-text-secondary/20 group-hover:scale-110 transition-transform duration-500">music_note</span>
                  
                  {/* Tombol Play melayang yang premium */}
                  <div className="absolute bottom-3 right-3 play-btn-overlay opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black shadow-xl hover:scale-110 active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-1 flex flex-col">
                  <h4 className="font-bold text-text-primary truncate group-hover:text-primary transition-colors">{playlist.name}</h4>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mt-1">Playlist • {user.username}</p>
                </div>
              </Link>
            ))}

            {/* Kalo tab Artis atau Album dipilih, tampilkan placeholder "Coming Soon" */}
            {(activeTab === 'Artis' || activeTab === 'Album') && (
              <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 opacity-50 bg-surface-container/10 rounded-[2rem] border border-border/10">
                <span className="material-symbols-outlined text-6xl animate-pulse">construction</span>
                <div>
                  <h3 className="text-xl font-bold">Lagi disiapin nih!</h3>
                  <p className="text-text-secondary max-w-md">Fitur buat koleksi {activeTab.toLowerCase()} lagi kita rakit biar makin mantap. Tungguin ya!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
