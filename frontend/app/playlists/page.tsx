'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, ListMusic, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import type { Song } from '@/store/playerStore';
import { SongTable } from '@/components/SongTable';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Playlist {
  id: string;
  userId?: string;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  thumbnail?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    songs: number;
  };
  songs?: Song[];
}

type PlaylistPayload = {
  data?: unknown;
  results?: unknown;
};

const readPayload = (payload: unknown): PlaylistPayload => (
  payload && typeof payload === 'object' ? payload as PlaylistPayload : {}
);

const isPlaylist = (value: unknown): value is Playlist => {
  if (!value || typeof value !== 'object') return false;

  const playlist = value as Partial<Playlist>;
  return typeof playlist.id === 'string' && typeof playlist.name === 'string';
};

const normalizePlaylistList = (payload: unknown): Playlist[] => {
  const { data, results } = readPayload(payload);
  const list = Array.isArray(results)
    ? results
    : Array.isArray(data)
      ? data
      : [];

  return list.filter(isPlaylist);
};

const normalizePlaylist = (payload: unknown): Playlist | null => {
  const { data, results } = readPayload(payload);
  const playlist = data ?? results;
  return isPlaylist(playlist) ? playlist : null;
};

const getPlayableSongs = (playlist: Playlist | null): Song[] => {
  if (!Array.isArray(playlist?.songs)) return [];

  return playlist.songs.filter((song) => (
    Boolean(song?.musicId) &&
    Boolean(song?.title) &&
    Boolean(song?.artist?.name) &&
    Boolean(song?.album?.cover?.medium)
  ));
};

/**
 * Halaman koleksi user.
 * Klik playlist membuka detail dulu, jadi musik hanya diputar saat user memilih lagu.
 */
export default function PlaylistsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [openingPlaylistId, setOpeningPlaylistId] = useState<string | null>(null);
  const [detailError, setDetailError] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [isUpdatingPlaylist, setIsUpdatingPlaylist] = useState(false);
  const [isDeletingPlaylist, setIsDeletingPlaylist] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistActionTarget, setPlaylistActionTarget] = useState<Playlist | null>(null);
  const [createError, setCreateError] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState('');

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
        setPlaylists(normalizePlaylistList(response.data));
      } catch (error) {
        console.error('Gagal mengambil playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylists();
  }, [user, router, accessToken]);

  const handleOpenCreateDialog = () => {
    setPlaylistName('');
    setCreateError('');
    setIsCreateDialogOpen(true);
  };

  const handleOpenPlaylist = async (playlist: Playlist) => {
    if (isDetailLoading) return;

    setSelectedPlaylist(playlist);
    setDetailError('');
    setIsDetailLoading(true);
    setOpeningPlaylistId(playlist.id);

    try {
      const response = await api.get(`/playlists/${playlist.id}`);
      const playlistDetail = normalizePlaylist(response.data);

      if (playlistDetail) {
        setSelectedPlaylist(playlistDetail);
      } else {
        setDetailError('Detail playlist belum bisa dibaca.');
      }
    } catch (error) {
      console.error('Gagal membuka playlist:', error);
      setDetailError('Playlist belum bisa dibuka. Coba lagi nanti.');
    } finally {
      setIsDetailLoading(false);
      setOpeningPlaylistId(null);
    }
  };

  const handleCreatePlaylist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreatingPlaylist) return;

    const name = playlistName.trim();
    if (!name) {
      setCreateError('Nama playlist wajib diisi.');
      return;
    }

    setIsCreatingPlaylist(true);
    setCreateError('');
    try {
      const response = await api.post('/playlists', {
        name,
        description: '',
        isPublic: false,
      });

      if (response.data.success) {
        const newPlaylist = normalizePlaylist(response.data);

        if (newPlaylist) {
          setPlaylists((current) => [newPlaylist, ...current]);
          setIsCreateDialogOpen(false);
          setPlaylistName('');
        }
      }
    } catch (error) {
      console.error('Gagal bikin playlist baru:', error);
      setCreateError('Maaf, playlist belum bisa dibuat. Coba lagi nanti.');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleOpenEditDialog = (playlist?: Playlist) => {
    const targetPlaylist = playlist ?? selectedPlaylist;
    if (!targetPlaylist) return;

    setPlaylistActionTarget(playlist ?? null);
    setEditName(targetPlaylist.name);
    setEditDescription(targetPlaylist.description || '');
    setEditError('');
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlaylist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetPlaylist = playlistActionTarget ?? selectedPlaylist;
    if (!targetPlaylist || isUpdatingPlaylist) return;

    const name = editName.trim();
    const description = editDescription.trim();

    if (!name) {
      setEditError('Nama playlist wajib diisi.');
      return;
    }

    setIsUpdatingPlaylist(true);
    setEditError('');

    try {
      const response = await api.put(`/playlists/${targetPlaylist.id}`, {
        name,
        description,
      });
      const updatedPlaylist = normalizePlaylist(response.data);

      if (updatedPlaylist) {
        setPlaylists((current) => (
          current.map((playlist) => (
            playlist.id === updatedPlaylist.id
              ? { ...playlist, ...updatedPlaylist }
              : playlist
          ))
        ));
        setSelectedPlaylist((current) => (
          current?.id === updatedPlaylist.id
            ? { ...current, ...updatedPlaylist, songs: current.songs }
            : current
        ));
        setPlaylistActionTarget(null);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Gagal memperbarui playlist:', error);
      setEditError('Playlist belum bisa diperbarui. Coba lagi nanti.');
    } finally {
      setIsUpdatingPlaylist(false);
    }
  };

  const handleDeletePlaylist = async () => {
    const targetPlaylist = playlistActionTarget ?? selectedPlaylist;
    if (!targetPlaylist || isDeletingPlaylist) return;

    setIsDeletingPlaylist(true);

    try {
      await api.delete(`/playlists/${targetPlaylist.id}`);
      setPlaylists((current) => (
        current.filter((playlist) => playlist.id !== targetPlaylist.id)
      ));
      setSelectedPlaylist((current) => (
        current?.id === targetPlaylist.id ? null : current
      ));
      setPlaylistActionTarget(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Gagal menghapus playlist:', error);
    } finally {
      setIsDeletingPlaylist(false);
    }
  };

  if (!user) return null;

  const visiblePlaylists = playlists.filter(isPlaylist);
  const selectedSongs = getPlayableSongs(selectedPlaylist);
  const selectedSongCount = selectedPlaylist?._count?.songs ?? selectedPlaylist?.songs?.length ?? 0;
  const dialogPlaylist = playlistActionTarget ?? selectedPlaylist;

  return (
    <div className="flex-1 flex flex-col min-w-0 relative bg-background h-full overflow-y-auto pb-[140px] md:pb-[90px] animate-fade-in">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl pt-8 pb-4 px-6 md:px-10 border-b border-transparent shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {selectedPlaylist ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedPlaylist(null);
                  setDetailError('');
                }}
                aria-label="Kembali ke daftar playlist"
                className="h-11 w-11 rounded-full text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-interactive flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-colors md:hidden">
                <span className="material-symbols-outlined">menu</span>
              </div>
            )}
            <h2 className="truncate font-bold text-2xl md:text-3xl tracking-tight">
              {selectedPlaylist ? selectedPlaylist.name : 'Koleksi Kamu'}
            </h2>
          </div>

          {selectedPlaylist && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenEditDialog()}
                className="h-11 text-text-secondary hover:text-text-primary"
              >
                <Edit3 className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setPlaylistActionTarget(null);
                  setIsDeleteDialogOpen(true);
                }}
                className="h-11"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Hapus</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 flex-1">
        {selectedPlaylist ? (
          <section className="space-y-8">
            <div className="flex flex-col gap-5 rounded-xl border border-white/10 bg-surface-container/25 p-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
                  Playlist
                </p>
                <h1 className="truncate text-3xl font-bold text-text-primary md:text-5xl">
                  {selectedPlaylist.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  {selectedPlaylist.description || 'Belum ada deskripsi untuk playlist ini.'}
                </p>
                <p className="mt-4 text-sm font-semibold text-text-secondary">
                  {selectedSongCount} lagu
                  {user.username ? ` - ${user.username}` : ''}
                </p>
              </div>
            </div>

            {isDetailLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : detailError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
                {detailError}
              </div>
            ) : selectedSongs.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/10 p-2">
                <SongTable songs={selectedSongs} />
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 p-8 text-center">
                <ListMusic className="mb-4 h-10 w-10 text-text-secondary" />
                <h3 className="text-lg font-bold text-text-primary">Playlist ini masih kosong</h3>
                <p className="mt-2 max-w-sm text-sm text-text-secondary">
                  Tambahkan lagu dari menu tiga titik di kartu atau daftar lagu.
                </p>
              </div>
            )}
          </section>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(30,215,96,0.2)]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
            <button
              type="button"
              onClick={handleOpenCreateDialog}
              className="group relative flex aspect-square min-h-[170px] w-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-dashed border-border/40 bg-surface-container/20 p-4 text-center transition-all duration-300 hover:border-primary/60 hover:bg-surface-container/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex flex-1 items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-surface-interactive flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:rotate-90">
                  <span className="material-symbols-outlined text-4xl font-bold">add</span>
                </div>
              </div>
              <div className="h-[58px] max-w-full">
                <h4 className="truncate font-bold text-text-primary group-hover:text-primary transition-colors">
                  Buat Playlist
                </h4>
                <p className="mt-1 truncate text-[10px] font-semibold text-text-secondary uppercase tracking-widest">
                  Mulai koleksi baru
                </p>
              </div>
            </button>

            {visiblePlaylists.map((playlist) => {
              const songCount = playlist._count?.songs ?? playlist.songs?.length ?? 0;

              return (
                <div
                  key={playlist.id}
                  className="group relative flex aspect-square min-h-[170px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-surface-container/35 p-4 text-left transition-all duration-300 hover:border-white/12 hover:bg-surface-elevated"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenPlaylist(playlist)}
                    disabled={isDetailLoading}
                    aria-label={`Buka playlist ${playlist.name}`}
                    className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait"
                  />

                  <div className="pointer-events-none absolute left-4 top-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-primary text-black opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-active:scale-95">
                    {openingPlaylistId === playlist.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ListMusic className="h-5 w-5" />
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Opsi playlist ${playlist.name}`}
                        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-text-secondary opacity-100 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="z-50 min-w-36 border-white/10 bg-[#18181b] text-white shadow-2xl"
                    >
                      <DropdownMenuItem
                        onSelect={() => {
                          handleOpenEditDialog(playlist);
                        }}
                        className="cursor-pointer focus:bg-white/10 focus:text-white"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          setPlaylistActionTarget(playlist);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="cursor-pointer focus:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="pointer-events-none z-[1] flex flex-1 items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-text-secondary/25 transition-transform duration-500 group-hover:scale-110">
                      music_note
                    </span>
                  </div>

                  <div className="pointer-events-none z-[1] h-[58px] min-w-0">
                    <h4 className="w-full truncate font-bold text-text-primary transition-colors group-hover:text-primary">
                      {playlist.name}
                    </h4>
                    <p className="mt-1 w-full truncate text-xs font-semibold uppercase tracking-widest text-text-secondary">
                      Playlist - {songCount} lagu - {user.username}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="border-white/10 bg-[#18181b] text-white sm:max-w-md">
          <form onSubmit={handleCreatePlaylist} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Buat Playlist</DialogTitle>
              <DialogDescription>
                Kasih nama playlist yang gampang kamu ingat.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <label htmlFor="playlist-name" className="text-sm font-semibold text-white">
                Nama playlist
              </label>
              <Input
                id="playlist-name"
                value={playlistName}
                onChange={(event) => {
                  setPlaylistName(event.target.value);
                  if (createError) setCreateError('');
                }}
                placeholder="Contoh: Lagu kerja malam"
                aria-invalid={Boolean(createError)}
                className="h-11 border-white/10 bg-black/30 text-white placeholder:text-white/35"
                autoFocus
              />
              {createError && (
                <p className="text-sm font-medium text-red-400">{createError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreatingPlaylist}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isCreatingPlaylist}>
                {isCreatingPlaylist ? 'Membuat...' : 'Buat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setPlaylistActionTarget(null);
        }}
      >
        <DialogContent className="border-white/10 bg-[#18181b] text-white sm:max-w-md">
          <form onSubmit={handleUpdatePlaylist} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Edit Playlist</DialogTitle>
              <DialogDescription>
                Ubah nama atau deskripsi playlist ini.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <label htmlFor="edit-playlist-name" className="text-sm font-semibold text-white">
                Nama playlist
              </label>
              <Input
                id="edit-playlist-name"
                value={editName}
                onChange={(event) => {
                  setEditName(event.target.value);
                  if (editError) setEditError('');
                }}
                aria-invalid={Boolean(editError)}
                className="h-11 border-white/10 bg-black/30 text-white placeholder:text-white/35"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-playlist-description" className="text-sm font-semibold text-white">
                Deskripsi
              </label>
              <Textarea
                id="edit-playlist-description"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                placeholder="Ceritakan isi playlist ini"
                className="min-h-24 resize-none border-white/10 bg-black/30 text-white placeholder:text-white/35"
              />
              {editError && (
                <p className="text-sm font-medium text-red-400">{editError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setPlaylistActionTarget(null);
                }}
                disabled={isUpdatingPlaylist}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isUpdatingPlaylist}>
                {isUpdatingPlaylist ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setPlaylistActionTarget(null);
        }}
      >
        <AlertDialogContent className="border-white/10 bg-[#18181b] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              Playlist "{dialogPlaylist?.name}" akan dihapus permanen dari koleksi kamu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeletingPlaylist}
              className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDeletePlaylist();
              }}
              disabled={isDeletingPlaylist}
              className="bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500/40"
            >
              {isDeletingPlaylist ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
