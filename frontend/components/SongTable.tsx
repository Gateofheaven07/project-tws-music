'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import { SongContextMenu } from '@/components/SongContextMenu';
import { usePlayerStore, type Song } from '@/store/playerStore';

interface SongTableProps {
  songs: Song[];
}

/**
 * Daftar lagu berbentuk tabel yang mudah dipindai.
 * Klik baris untuk memutar lagu, atau buka menu tiga titik untuk aksi tambahan.
 */
export const SongTable: React.FC<SongTableProps> = ({ songs }) => {
  const { currentSong, isPlaying, startPlayback } = usePlayerStore();

  // Simpan lagu dan posisi tombol supaya menu muncul di dekat tombol yang diklik.
  const [contextMenu, setContextMenu] = useState<{
    song: Song;
    x: number;
    y: number;
  } | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUnavailableMessage = (song: Song) => (
    song.playback?.errorReason === 'youtube_quota_exceeded'
      ? 'Playback belum tersedia karena quota YouTube habis.'
      : 'Playback belum tersedia.'
  );

  const handlePlaySong = (index: number) => {
    if (songs[index]?.playback?.status === 'unavailable') return;

    startPlayback(songs, index);
  };

  const handleMoreClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ song, x: rect.left - 180, y: rect.bottom + 4 });
  };

  return (
    <>
      <div className="flex flex-col gap-2 md:hidden">
        {songs.map((song, index) => {
          const isCurrent = currentSong?.musicId === song.musicId;
          const isPlaybackUnavailable = song.playback?.status === 'unavailable';

          return (
            <div
              key={song.musicId}
              onClick={() => handlePlaySong(index)}
              className={`group flex min-w-0 items-center gap-3 rounded-lg p-2 transition-colors ${
                isCurrent ? 'bg-white/10' : 'hover:bg-[#2a2a2a]'
              } ${isPlaybackUnavailable ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              aria-disabled={isPlaybackUnavailable}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#1f1f1f] shadow-md">
                <Image
                  src={song.album.cover.medium}
                  alt={song.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-bold ${isCurrent ? 'text-primary' : 'text-white'}`}>
                  {song.title}
                </p>
                <p className="truncate text-xs text-[#b3b3b3]">{song.artist.name}</p>
                {isPlaybackUnavailable ? (
                  <p className="truncate text-[11px] text-amber-300/90">
                    {getUnavailableMessage(song)}
                  </p>
                ) : (
                  <p className="truncate text-[11px] text-[#6a6a6a]">{song.album.name}</p>
                )}
              </div>

              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-[#b3b3b3]">
                {formatDuration(song.duration)}
              </span>

              <button
                onClick={(e) => handleMoreClick(e, song)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#b3b3b3] transition-all hover:bg-white/10 hover:text-white"
                title="Opsi lainnya"
                aria-label={`Opsi untuk ${song.title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="hidden w-full select-none border-collapse text-left md:block">
        <div className="grid grid-cols-[48px_1fr_1fr_120px_60px_40px] md:grid-cols-[48px_2fr_1.5fr_1fr_80px_40px] px-4 py-2 border-b border-white/5 text-[12px] font-bold text-text-secondary tracking-widest uppercase mb-4">
          <div className="flex justify-center">#</div>
          <div>JUDUL</div>
          <div className="hidden md:block">ALBUM</div>
          <div className="hidden lg:block">TANGGAL DITAMBAHKAN</div>
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
          </div>
          <div />
        </div>

        <div className="flex flex-col gap-1">
          {songs.map((song, index) => {
            const isCurrent = currentSong?.musicId === song.musicId;
            const isPlaybackUnavailable = song.playback?.status === 'unavailable';

            return (
              <div
                key={song.musicId}
                onClick={() => handlePlaySong(index)}
                className={`grid grid-cols-[48px_1fr_1fr_120px_60px_40px] md:grid-cols-[48px_2fr_1.5fr_1fr_80px_40px] px-4 py-2 rounded-md transition-all duration-200 group cursor-pointer items-center
                  ${isCurrent ? 'bg-white/10' : 'hover:bg-[#2a2a2a]'}
                  ${isPlaybackUnavailable ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                `}
                aria-disabled={isPlaybackUnavailable}
              >
                <div className="flex justify-center items-center relative h-10">
                  <span
                    className={`text-base font-normal ${isCurrent ? 'text-primary' : 'text-[#b3b3b3]'} ${isPlaybackUnavailable ? 'group-hover:opacity-100' : 'group-hover:opacity-0'} transition-opacity`}
                  >
                    {index + 1}
                  </span>
                  {!isPlaybackUnavailable && (
                    <span
                      className="material-symbols-outlined absolute opacity-0 group-hover:opacity-100 transition-opacity text-white text-[24px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isCurrent && isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  )}
                </div>

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
                    <span
                      className={`text-base font-medium truncate ${isCurrent ? 'text-primary' : 'text-white'}`}
                    >
                      {song.title}
                    </span>
                    <span className="text-sm text-[#b3b3b3] truncate group-hover:text-white transition-colors">
                      {song.artist.name}
                    </span>
                    {isPlaybackUnavailable && (
                      <span className="truncate text-xs text-amber-300/90">
                        {getUnavailableMessage(song)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden md:block truncate text-sm text-[#b3b3b3] group-hover:text-white transition-colors">
                  {song.album.name}
                </div>

                <div className="hidden lg:block text-sm text-[#b3b3b3]">
                  {song.releaseDate
                    ? new Date(song.releaseDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Baru saja'}
                </div>

                <div className="flex justify-center text-sm text-[#b3b3b3] tabular-nums">
                  {formatDuration(song.duration)}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={(e) => handleMoreClick(e, song)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-all text-[#b3b3b3] hover:text-white rounded-full hover:bg-white/10"
                    title="Opsi lainnya"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {contextMenu && (
        <SongContextMenu
          song={contextMenu.song}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};
