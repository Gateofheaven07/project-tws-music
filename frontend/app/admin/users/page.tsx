'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin, type AdminUser } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Search,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Trash2,
  ListMusic,
  Heart,
  PlayCircle,
  Plus,
  Edit2,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { fetchUsers, deleteUser, createUser, updateUser } = useAdmin();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers({
        page,
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      });
      setUsers(data.users);
      setTotalPages(data.meta.totalPages);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search, roleFilter]);

  const handleDelete = async (id: string, username: string) => {
    if (!window.confirm(`Yakin ingin menghapus user ${username} secara permanen? Semua data (playlist, riwayat) akan ikut terhapus.`)) {
      return;
    }
    try {
      await deleteUser(id);
      toast.success('User berhasil dihapus.');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ username: '', email: '', password: '', role: 'USER' });
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: AdminUser) => {
    setModalMode('edit');
    setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    setEditingUserId(user.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        toast.success('Pengguna baru berhasil dibuat.');
      } else if (modalMode === 'edit' && editingUserId) {
        await updateUser(editingUserId, {
          username: formData.username,
          email: formData.email,
          password: formData.password || undefined, // hanya kirim jika diisi
        });
        toast.success('Data pengguna berhasil diperbarui.');
      }
      closeModal();
      loadUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'SUPER_ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
          <ShieldCheck className="h-3 w-3" /> SUPER_ADMIN
        </span>
      );
    }
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
          <ShieldAlert className="h-3 w-3" /> ADMIN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-[#b3b3b3]">
        <Shield className="h-3 w-3" /> USER
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-white">Manajemen User</h1>
          <p className="mt-1 text-[13px] text-[#666]">Kelola akun, profil, dan data pengguna</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              placeholder="Cari email / username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full min-w-[240px] rounded-full border border-white/[0.06] bg-[#111] pl-9 pr-4 text-[13px] text-white placeholder:text-[#666] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Role Filter (Hanya tampil jika Super Admin) */}
          {currentUser?.role === 'SUPER_ADMIN' && (
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 cursor-pointer rounded-full border border-white/[0.06] bg-[#111] px-4 text-[13px] text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none transition-all"
            >
              <option value="ALL">Semua Role</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          )}

          <button
            onClick={openCreateModal}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-[13px] font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Tambah Pengguna
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-4 font-medium text-[#888]">User</th>
                <th className="px-5 py-4 font-medium text-[#888]">Role</th>
                <th className="px-5 py-4 font-medium text-[#888]">Login Via</th>
                <th className="px-5 py-4 font-medium text-[#888]">Statistik</th>
                <th className="px-5 py-4 font-medium text-[#888]">Terdaftar</th>
                <th className="px-5 py-4 font-medium text-[#888]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#666]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#666]">
                    Tidak ada user yang ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[13px] font-bold text-primary">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            u.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{u.username}</p>
                          <p className="truncate text-[#666]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{getRoleBadge(u.role)}</td>
                    <td className="px-5 py-3 capitalize text-[#888]">{u.authProvider}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 text-[#666]">
                        <span className="flex items-center gap-1" title="Playlists"><ListMusic className="h-3.5 w-3.5"/> {u._count.playlists}</span>
                        <span className="flex items-center gap-1" title="Disukai"><Heart className="h-3.5 w-3.5"/> {u._count.likedSongs}</span>
                        <span className="flex items-center gap-1" title="Diputar"><PlayCircle className="h-3.5 w-3.5"/> {u._count.playHistory}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#888]">
                      {new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-md p-1.5 text-[#666] hover:bg-white/[0.06] hover:text-white outline-none">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-white/10 text-white shadow-xl">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/users/${u.id}`)}
                            className="cursor-pointer focus:bg-white/10"
                          >
                            Lihat Detail
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-white/10" />
                          
                          {/* Edit Akun (hanya jika bukan diri sendiri dan sesuai hierarki) */}
                          {u.id !== currentUser?.id && (u.role !== 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                            <DropdownMenuItem
                              onClick={() => openEditModal(u)}
                              className="cursor-pointer focus:bg-white/10"
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Akun
                            </DropdownMenuItem>
                          )}

                          {/* Hapus User (hanya jika bukan diri sendiri dan bukan super admin) */}
                          {u.id !== currentUser?.id && u.role !== 'SUPER_ADMIN' && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(u.id, u.username)}
                              className="cursor-pointer focus:bg-red-500/20 text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus Permanen
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
            <p className="text-[12px] text-[#666]">
              Halaman <span className="font-medium text-white">{page}</span> dari <span className="font-medium text-white">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-white/[0.06] bg-transparent px-3 py-1.5 text-[12px] font-medium text-white hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-white/[0.06] bg-transparent px-3 py-1.5 text-[12px] font-medium text-white hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#1a1a1a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
              </h2>
              <button onClick={closeModal} className="text-[#666] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-[#888]">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-10 w-full rounded-md border border-white/[0.06] bg-[#111] px-3 text-[13px] text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-medium text-[#888]">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 w-full rounded-md border border-white/[0.06] bg-[#111] px-3 text-[13px] text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-medium text-[#888]">
                  Password {modalMode === 'edit' && <span className="text-[#555]">(Kosongkan jika tidak ingin diubah)</span>}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-10 w-full rounded-md border border-white/[0.06] bg-[#111] px-3 text-[13px] text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Password"
                />
              </div>

              {/* Pilihan Role hanya untuk SUPER_ADMIN dan hanya saat Create */}
              {modalMode === 'create' && currentUser?.role === 'SUPER_ADMIN' && (
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-[#888]">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="h-10 w-full cursor-pointer rounded-md border border-white/[0.06] bg-[#111] px-3 text-[13px] text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="USER">User Biasa</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full px-5 py-2 text-[13px] font-bold text-white hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-5 py-2 text-[13px] font-bold text-black hover:scale-105 active:scale-95 disabled:opacity-50 transition-transform"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
