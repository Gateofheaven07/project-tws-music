'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePlayerStore } from '@/store/playerStore';
import type { Song } from '@/store/playerStore';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { MobileSidebarButton } from '@/components/Sidebar';
import {
  Camera, User, Lock, History, Loader2,
  Pencil, CheckCircle2, XCircle, Play, Clock,
} from 'lucide-react';

// Format durasi detik ke format mm:ss
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Format tanggal ke bahasa Indonesia yang mudah dibaca
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Format waktu relatif untuk history (misal: "2 jam yang lalu")
const formatRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} hari yang lalu`;
  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return 'Baru saja';
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const startPlayback = usePlayerStore((s) => s.startPlayback);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    profile,
    history,
    isLoading,
    isUpdating,
    fetchProfile,
    updateUsername,
    updatePassword,
    uploadAvatar,
    fetchHistory,
  } = useProfile();

  // State untuk form edit username
  const [newUsername, setNewUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // State untuk form edit password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // State untuk preview avatar sebelum upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  // Redirect ke login kalau belum login
  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    fetchProfile();
    fetchHistory();
  }, [user, router, fetchProfile, fetchHistory]);

  // Sync username form saat data profil berhasil dimuat
  useEffect(() => {
    if (profile) {
      setNewUsername(profile.username);
    }
  }, [profile]);

  // ── Handler: Update Username ──────────────────────────────────────────────
  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername.trim() === profile?.username) {
      setIsEditingUsername(false);
      return;
    }

    const result = await updateUsername(newUsername.trim());
    if (result.success) {
      toast({ title: 'Username berhasil diperbarui.' });
      setIsEditingUsername(false);
    } else {
      toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
    }
  };

  // ── Handler: Update Password ──────────────────────────────────────────────
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ title: 'Password baru tidak cocok', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: 'Password minimal 6 karakter', variant: 'destructive' });
      return;
    }

    const result = await updatePassword(currentPassword, newPassword);
    if (result.success) {
      toast({ title: 'Password berhasil diperbarui.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
    } else {
      toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
    }
  };

  // ── Handler: Pilih File Avatar ────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file di sisi client
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Hanya file JPG, PNG, atau WebP yang diizinkan', variant: 'destructive' });
      return;
    }

    // Validasi ukuran file (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Ukuran file maksimal 5MB', variant: 'destructive' });
      return;
    }

    // Tampilkan preview gambar sebelum upload
    const previewUrl = URL.createObjectURL(file);
    setAvatarLoadFailed(false);
    setAvatarPreview(previewUrl);

    // Langsung upload ke server
    const result = await uploadAvatar(file);
    if (result.success) {
      toast({ title: 'Foto profil berhasil diperbarui.' });
      setAvatarPreview(null);
      setAvatarLoadFailed(false);
      URL.revokeObjectURL(previewUrl);
    } else {
      toast({ title: 'Gagal upload foto', description: result.error, variant: 'destructive' });
      setAvatarPreview(null);
      URL.revokeObjectURL(previewUrl);
    }

    // Reset input agar file yang sama bisa dipilih lagi
    e.target.value = '';
  };

  // ── Handler: Putar Ulang Lagu dari History ────────────────────────────────
  const handlePlayFromHistory = (item: typeof history[0]) => {
    if (!item.videoId) {
      toast({ title: 'Lagu ini tidak tersedia untuk diputar', variant: 'destructive' });
      return;
    }

    // Konversi item history ke format Song yang dimengerti playerStore
    const song: Song = {
      musicId: item.musicId,
      title: item.title,
      artist: { id: 'unknown', name: item.artist },
      album: {
        id: 'unknown',
        name: '',
        cover: { small: item.cover, medium: item.cover, big: item.cover, xl: item.cover },
      },
      duration: item.duration,
      genres: [],
      releaseDate: '',
      playback: {
        provider: 'youtube',
        type: 'iframe',
        videoId: item.videoId,
        embedUrl: `https://www.youtube.com/embed/${item.videoId}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
      },
      statistics: { popularity: 0 },
    };

    startPlayback([song], 0);
    toast({ title: `Memutar ${item.title}` });
  };

  // URL avatar yang ditampilkan: preview > profil > null
  const displayAvatar = avatarPreview || profile?.avatar;
  const shouldShowAvatar = Boolean(displayAvatar) && !avatarLoadFailed;

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [displayAvatar]);

  // ── Tampilan loading awal ─────────────────────────────────────────────────
  if (!user) return null;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background no-scrollbar">
      <Toaster />

      {/* ── Header Gradient ────────────────────────────────────────────────── */}
      <div className="relative h-44 shrink-0 bg-gradient-to-b from-indigo-900/60 via-purple-900/40 to-background sm:h-48">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
        <div className="absolute left-4 top-4 z-20 md:hidden">
          <MobileSidebarButton />
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-24 w-full max-w-4xl px-4 pb-36 sm:px-6 md:px-8 md:pb-32">

        {/* ── Profil Header Card ─────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-end">
          {/* Avatar + tombol upload */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-background shadow-2xl bg-[#282828]">
              {isLoading && !displayAvatar ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : shouldShowAvatar ? (
                <img
                  src={displayAvatar || ''}
                  alt="Foto profil"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
                  <span className="text-5xl font-bold text-white">
                    {(profile?.username || user.username)[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Overlay kamera saat hover */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdating}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              title="Ganti foto profil"
            >
              {isUpdating ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </button>

            {/* Input file tersembunyi */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Info user */}
          <div className="flex min-w-0 flex-col items-center gap-1 pb-2 text-center md:items-start md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b3b3b3]">Profil</span>
            <h1 className="max-w-full break-words text-3xl font-black leading-tight text-white md:text-5xl">
              {profile?.username || user.username}
            </h1>
            <p className="max-w-full truncate text-sm text-[#b3b3b3]">{profile?.email || user.email}</p>
            {profile?.createdAt && (
              <p className="text-[#6a6a6a] text-xs mt-1">
                Bergabung sejak {formatDate(profile.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* ── Grid Dua Kolom (Edit Forms) ─────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Card: Edit Username */}
          <div className="rounded-lg border border-white/5 bg-[#181818] p-4 transition-colors hover:bg-[#1e1e1e] sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="font-bold text-white">Edit Username</h2>
            </div>

            {isEditingUsername ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#282828] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Masukkan username baru"
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateUsername()}
                  autoFocus
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleUpdateUsername}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-bold py-2 rounded-lg text-sm hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Simpan
                  </button>
                  <button
                    onClick={() => { setIsEditingUsername(false); setNewUsername(profile?.username || ''); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#282828] text-[#b3b3b3] rounded-lg text-sm hover:text-white transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#6a6a6a] mb-1">Username saat ini</p>
                  <p className="truncate font-medium text-white">{profile?.username || user.username}</p>
                </div>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#b3b3b3] hover:text-white rounded-lg text-xs font-medium transition-all"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Card: Edit Password */}
          <div className="rounded-lg border border-white/5 bg-[#181818] p-4 transition-colors hover:bg-[#1e1e1e] sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="font-bold text-white">Ubah Password</h2>
            </div>

            {isEditingPassword ? (
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#282828] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Password lama"
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#282828] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Password baru (min. 6 karakter)"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#282828] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Konfirmasi password baru"
                  required
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-bold py-2 rounded-lg text-sm hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#282828] text-[#b3b3b3] rounded-lg text-sm hover:text-white transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#6a6a6a] mb-1">Password</p>
                  <p className="text-white font-medium tracking-widest">••••••••</p>
                </div>
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#b3b3b3] hover:text-white rounded-lg text-xs font-medium transition-all"
                >
                  <Pencil className="w-3 h-3" />
                  Ubah
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Seksi: Riwayat Putar ────────────────────────────────────────────── */}
        <div className="rounded-lg border border-white/5 bg-[#181818] p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
              <History className="w-4 h-4 text-green-400" />
            </div>
            <h2 className="font-bold text-white text-lg">Riwayat Putar</h2>
            {history.length > 0 && (
              <span className="ml-auto text-xs text-[#6a6a6a]">{history.length} lagu</span>
            )}
          </div>

          {isLoading ? (
            // Skeleton loading saat data dimuat
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg animate-pulse">
                  <div className="w-12 h-12 rounded-md bg-[#282828] shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3.5 bg-[#282828] rounded w-2/3" />
                    <div className="h-3 bg-[#282828] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-[#6a6a6a]" />
              </div>
              <p className="text-[#b3b3b3] font-medium">Belum ada riwayat putar</p>
              <p className="text-[#6a6a6a] text-sm mt-1">Mulai dengarkan musik untuk melihat riwayat di sini</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handlePlayFromHistory(item)}
                  className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5 sm:gap-4 sm:p-3"
                >
                  {/* Nomor urut / tombol play */}
                  <div className="w-6 shrink-0 text-center">
                    <span className="text-[#6a6a6a] text-sm group-hover:hidden">{index + 1}</span>
                    <Play className="w-4 h-4 text-white hidden group-hover:block mx-auto" fill="currentColor" />
                  </div>

                  {/* Cover lagu */}
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-[#282828] shrink-0 shadow-md">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#6a6a6a] text-xl">music_note</span>
                      </div>
                    )}
                  </div>

                  {/* Info lagu */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[#b3b3b3] text-xs truncate">{item.artist}</p>
                  </div>

                  {/* Waktu putar */}
                  <div className="hidden md:flex items-center gap-1 shrink-0 text-[#6a6a6a]">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{formatRelativeTime(item.playedAt)}</span>
                  </div>

                  {/* Durasi */}
                  <span className="text-[#6a6a6a] text-xs shrink-0 w-10 text-right">
                    {formatDuration(item.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
