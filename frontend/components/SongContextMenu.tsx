'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, ListPlus, X } from 'lucide-react';
import { useMusicStore } from '@/store/musicStore';
import { useMusic } from '@/hooks/useMusic';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Song } from '@/store/playerStore';

interface SongContextMenuProps {
  song: Song;
  // Posisi menu relatif terhadap window (dari event click)
  position: { x: number; y: number };
  onClose: () => void;
}

interface Playlist {
  id: string;
  name: string;
}

/**
 * SongContextMenu - Menu popup yang muncul saat ikon 3 titik diklik.
 * Menyediakan opsi: Like/Unlike lagu dan Tambah ke Playlist.
 */
export const SongContextMenu = ({ song, position, onClose }: SongContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { favoriteSongs } = useMusicStore();
  const { addFavorite, removeFavorite } = useMusic();

  // State untuk sub-menu playlist
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [addedToPlaylistId, setAddedToPlaylistId] = useState<string | null>(null);

  const isFavorited = favoriteSongs.some((s) => s.musicId === song.musicId);

  // Tutup menu kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Tutup menu kalau tekan Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Hitung posisi menu supaya tidak keluar dari layar
  const getMenuStyle = () => {
    const menuWidth = 220;
    const menuHeight = 120;
    const padding = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = position.x;
    let y = position.y;

    if (x + menuWidth > vw - padding) x = vw - menuWidth - padding;
    if (y + menuHeight > vh - padding) y = position.y - menuHeight;

    return { left: x, top: y };
  };

  // Ambil daftar playlist user
  const loadPlaylists = async () => {
    if (!user) return;
    setIsLoadingPlaylists(true);
    try {
      const res = await api.get('/playlists');
      setPlaylists(res.data.results || []);
    } catch (err) {
      console.error('Gagal ngambil playlist:', err);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFavorite(song.musicId);
    } else {
      addFavorite(song);
    }
    onClose();
  };

  const handleShowPlaylistMenu = () => {
    setShowPlaylistMenu(true);
    loadPlaylists();
  };

  // Tambah lagu ke playlist yang dipilih
  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await api.post(`/playlists/${playlistId}/songs`, {
        musicId: song.musicId,
        title: song.title,
        artist: song.artist?.name || 'Unknown',
        cover: song.album?.cover?.medium || '',
        duration: song.duration || 0,
        videoId: song.playback?.videoId || null,
      });
      setAddedToPlaylistId(playlistId);
      // Tutup menu setelah 800ms biar user tau berhasil
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error('Gagal tambahin ke playlist:', err);
    }
  };

  const menuStyle = getMenuStyle();

  return (
    <div
      ref={menuRef}
      className="fixed z-[200] rounded-xl overflow-hidden shadow-2xl border border-white/10"
      style={{
        left: menuStyle.left,
        top: menuStyle.top,
        background: 'rgba(24, 24, 27, 0.97)',
        backdropFilter: 'blur(20px)',
        minWidth: 220,
        animation: 'contextMenuIn 0.15s ease-out',
      }}
    >
      {!showPlaylistMenu ? (
        // Menu utama
        <div className="py-1">
          {/* Tombol Like / Unlike */}
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
              isFavorited
                ? 'text-[#1ed760] hover:bg-white/5'
                : 'text-white/80 hover:bg-white/5 hover:text-white'
            )}
          >
            <Heart
              className={cn('h-4 w-4 flex-shrink-0', isFavorited && 'fill-current')}
            />
            {isFavorited ? 'Hapus dari Liked Songs' : 'Tambah ke Liked Songs'}
          </button>

          {/* Tombol Tambah ke Playlist */}
          {user && (
            <button
              onClick={handleShowPlaylistMenu}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ListPlus className="h-4 w-4 flex-shrink-0" />
              Tambahkan ke Playlist
            </button>
          )}
        </div>
      ) : (
        // Sub-menu pilih playlist
        <div>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <button
              onClick={() => setShowPlaylistMenu(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-white">Pilih Playlist</span>
          </div>

          {isLoadingPlaylists ? (
            <div className="py-4 text-center">
              <div className="w-5 h-5 border-2 border-[#1ed760] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="px-4 py-4 text-sm text-white/40 text-center">
              Belum ada playlist nih
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto py-1">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddToPlaylist(pl.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors',
                    addedToPlaylistId === pl.id
                      ? 'text-[#1ed760] bg-white/5'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className="truncate text-left">{pl.name}</span>
                  {addedToPlaylistId === pl.id && (
                    <span className="text-[#1ed760] text-xs font-bold ml-2 flex-shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes contextMenuIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
