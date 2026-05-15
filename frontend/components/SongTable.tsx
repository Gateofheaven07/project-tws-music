'use client';

import React from 'react';
import Image from 'next/image';
import { usePlayerStore, type Song } from '@/store/playerStore';

interface SongTableProps {
  songs: Song[];
}

/**
 * Komponen SongTable - Menampilkan daftar lagu dalam format tabel list yang premium.
 * Desain ini mengacu pada standar Google Stitch "Obsidian Pulse" dengan layout
 * yang bersih, scannable, dan responsif.
 */
export const SongTable: React.FC<SongTableProps> = ({ songs }) => {
  const { currentSong, isPlaying, setQueue, setCurrentSongIndex, play } = usePlayerStore();

  // Helper buat format detik jadi menit:detik (contoh: 225 -> 3:45)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fungsi buat play lagu pas barisnya diklik
  const handlePlaySong = (index: number) => {
    setQueue(songs);
    setCurrentSongIndex(index);
    play();
  };

  return (
    <div className="w-full text-left border-collapse select-none">
      {/* Header Tabel - Huruf kapital kecil, warna abu-abu, padding pas */}
      <div className="grid grid-cols-[48px_1fr_1fr_120px_60px] md:grid-cols-[48px_2fr_1.5fr_1fr_80px] px-4 py-2 border-b border-white/5 text-[12px] font-bold text-text-secondary tracking-widest uppercase mb-4">
        <div className="flex justify-center">#</div>
        <div>JUDUL</div>
        <div className="hidden md:block">ALBUM</div>
        <div className="hidden lg:block">TANGGAL DITAMBAHKAN</div>
        <div className="flex justify-center">
          <span className="material-symbols-outlined text-[18px]">schedule</span>
        </div>
      </div>

      {/* Baris Lagu */}
      <div className="flex flex-col gap-1">
        {songs.map((song, index) => {
          const isCurrent = currentSong?.musicId === song.musicId;
          
          return (
            <div
              key={song.musicId}
              onClick={() => handlePlaySong(index)}
              className={`grid grid-cols-[48px_1fr_1fr_120px_60px] md:grid-cols-[48px_2fr_1.5fr_1fr_80px] px-4 py-2 rounded-md transition-all duration-200 group cursor-pointer items-center
                ${isCurrent ? 'bg-white/10' : 'hover:bg-[#2a2a2a]'}
              `}
            >
              {/* Kolom 1: Nomor / Icon Play */}
              <div className="flex justify-center items-center relative h-10">
                <span className={`text-base font-normal ${isCurrent ? 'text-primary' : 'text-[#b3b3b3]'} group-hover:opacity-0 transition-opacity`}>
                  {index + 1}
                </span>
                <span className="material-symbols-outlined absolute opacity-0 group-hover:opacity-100 transition-opacity text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isCurrent && isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </div>

              {/* Kolom 2: Judul & Thumbnail */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden rounded-sm shadow-md">
                  <Image
                    src={song.album.cover.medium}
                    alt={song.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-base font-medium truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                    {song.title}
                  </span>
                  <span className="text-sm text-[#b3b3b3] truncate group-hover:text-white transition-colors">
                    {song.artist.name}
                  </span>
                </div>
              </div>

              {/* Kolom 3: Album (Hidden on mobile) */}
              <div className="hidden md:block truncate text-sm text-[#b3b3b3] group-hover:text-white transition-colors">
                {song.album.name}
              </div>

              {/* Kolom 4: Tanggal (Hidden on mobile/tablet) */}
              <div className="hidden lg:block text-sm text-[#b3b3b3]">
                {/* Mocking date since we don't always have it in the object */}
                {song.releaseDate ? new Date(song.releaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}
              </div>

              {/* Kolom 5: Durasi */}
              <div className="flex justify-center text-sm text-[#b3b3b3] tabular-nums">
                {formatDuration(song.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
