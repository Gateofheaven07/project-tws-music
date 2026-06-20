'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin, type AdminUserDetail } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ListMusic,
  Heart,
  PlayCircle,
  MessageSquareText,
  Star,
  Trash2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { user: currentUser } = useAuth();
  const { fetchUserDetail, updateUserRole, deleteUser } = useAdmin();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = async () => {
    try {
      const data = await fetchUserDetail(id);
      setUser(data);
    } catch (err: any) {
      toast.error(err.message);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleRoleChange = async (newRole: string) => {
    try {
      await updateUserRole(id, newRole);
      toast.success('Role berhasil diubah.');
      loadDetail();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus user ${user?.username} secara permanen? Semua data akan ikut terhapus.`)) {
      return;
    }
    try {
      await deleteUser(id);
      toast.success('User berhasil dihapus.');
      router.push('/admin/users');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <p className="text-[13px] text-[#666]">Memuat detail user...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isSelf = currentUser?.id === user.id;

  const getRoleBadge = (role: string) => {
    if (role === 'SUPER_ADMIN') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-400">
          <ShieldCheck className="h-3.5 w-3.5" /> SUPER_ADMIN
        </span>
      );
    }
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold text-primary">
          <ShieldAlert className="h-3.5 w-3.5" /> ADMIN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-[#b3b3b3]">
        <Shield className="h-3.5 w-3.5" /> USER
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] font-medium text-[#888] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar User
      </button>

      {/* Profil Header */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111]">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-[#111]" />
        <div className="relative px-6 pb-6">
          <div className="absolute -top-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#111] bg-primary/20 text-[32px] font-bold text-primary shadow-xl">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              user.username[0].toUpperCase()
            )}
          </div>
          
          <div className="ml-28 flex flex-col justify-between pt-3 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-[24px] font-bold text-white">{user.username}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-[#888]">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Bergabung {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Via {user.authProvider}</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">{getRoleBadge(user.role)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Kolom Kiri: Statistik */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/[0.06] bg-[#111] p-6">
            <h3 className="mb-6 text-[14px] font-bold tracking-tight text-white">Statistik Aktivitas</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                <ListMusic className="mx-auto mb-2 h-6 w-6 text-blue-400" />
                <p className="text-[20px] font-bold text-white">{user._count.playlists}</p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Playlists</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                <Heart className="mx-auto mb-2 h-6 w-6 text-pink-400" />
                <p className="text-[20px] font-bold text-white">{user._count.likedSongs}</p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Disukai</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-4 text-center">
                <PlayCircle className="mx-auto mb-2 h-6 w-6 text-purple-400" />
                <p className="text-[20px] font-bold text-white">{user._count.playHistory}</p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Diputar</p>
              </div>
            </div>
          </div>

          {/* Ulasan Aplikasi */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-[14px] font-bold tracking-tight text-white">
              <MessageSquareText className="h-4 w-4" />
              Ulasan Aplikasi
            </h3>
            {user.appReview ? (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: user.appReview.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 text-[11px] text-[#666]">
                    {new Date(user.appReview.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-[#ccc]">{user.appReview.review}</p>
              </div>
            ) : (
              <p className="text-[13px] text-[#666]">User ini belum memberikan ulasan.</p>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Actions */}
        <div className="space-y-6">
          {/* Kelola Role */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111] p-6">
            <h3 className="mb-4 text-[14px] font-bold tracking-tight text-white">Ubah Role</h3>
            {isSelf ? (
              <div className="rounded-lg bg-blue-500/10 p-3 text-[12px] text-blue-400">
                Kamu tidak bisa mengubah role akunmu sendiri dari sini.
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleRoleChange('USER')}
                  disabled={user.role === 'USER'}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.06] disabled:opacity-50"
                >
                  Jadikan USER
                </button>
                <button
                  onClick={() => handleRoleChange('ADMIN')}
                  disabled={user.role === 'ADMIN'}
                  className="w-full rounded-lg border border-primary/20 bg-primary/10 py-2.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                >
                  Jadikan ADMIN
                </button>
                <button
                  onClick={() => handleRoleChange('SUPER_ADMIN')}
                  disabled={user.role === 'SUPER_ADMIN'}
                  className="w-full rounded-lg border border-amber-500/20 bg-amber-500/10 py-2.5 text-[13px] font-medium text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
                >
                  Jadikan SUPER_ADMIN
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-500/20 bg-[#111] p-6">
            <h3 className="mb-4 text-[14px] font-bold tracking-tight text-red-400">Danger Zone</h3>
            {isSelf ? (
              <p className="text-[12px] text-[#666]">Kamu tidak bisa menghapus akunmu sendiri dari sini.</p>
            ) : user.role === 'SUPER_ADMIN' ? (
              <p className="text-[12px] text-[#666]">Super Admin tidak dapat dihapus melalui dashboard.</p>
            ) : (
              <>
                <p className="mb-4 text-[12px] leading-relaxed text-[#888]">
                  Tindakan ini permanen. Semua data (playlist, disukai, histori) akan ikut terhapus.
                </p>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 py-2.5 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus User
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
