'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAdmin, type AdminReview } from '@/hooks/useAdmin';
import { Trash2, Star, Filter, MessageCircleReply, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
  const { fetchReviews, deleteReview, replyToReview } = useAdmin();

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [refreshKey, setRefreshKey] = useState(0);

  // Baseline timestamp ulasan terbaru yang sudah diketahui (untuk deteksi ulasan baru).
  const latestSeenRef = useRef<string | null>(null);
  const baselineSetRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<AdminReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews({
        page,
        rating: ratingFilter !== 'ALL' ? ratingFilter : undefined,
        sort: sortOrder,
      });
      setReviews(data.reviews);
      setTotalPages(data.meta.totalPages);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, ratingFilter, sortOrder, refreshKey]);

  // Polling: deteksi ulasan baru yang masuk dan tampilkan notifikasi.
  const checkForNewReviews = useCallback(async () => {
    try {
      const data = await fetchReviews({ page: 1, sort: 'newest' });
      const latest = data.reviews[0];
      if (!latest) return;

      // Set baseline saat pertama kali tanpa memunculkan notifikasi.
      if (!baselineSetRef.current) {
        latestSeenRef.current = latest.createdAt;
        baselineSetRef.current = true;
        return;
      }

      const lastSeen = latestSeenRef.current;
      if (lastSeen && new Date(latest.createdAt).getTime() > new Date(lastSeen).getTime()) {
        const newCount = data.reviews.filter(
          (r) => new Date(r.createdAt).getTime() > new Date(lastSeen).getTime()
        ).length;

        toast.info(newCount > 1 ? `${newCount} ulasan baru masuk!` : 'Ada ulasan baru masuk!', {
          description: `${latest.user.username}: "${latest.review.slice(0, 60)}${latest.review.length > 60 ? '…' : ''}"`,
        });

        latestSeenRef.current = latest.createdAt;
        setRefreshKey((k) => k + 1); // segarkan tabel
      }
    } catch {
      // Diamkan error polling agar tidak mengganggu admin.
    }
  }, [fetchReviews]);

  useEffect(() => {
    checkForNewReviews(); // set baseline saat mount
    const intervalId = setInterval(checkForNewReviews, 30000);
    return () => clearInterval(intervalId);
  }, [checkForNewReviews]);

  const handleDelete = async (id: string, username: string) => {
    if (!window.confirm(`Yakin ingin menghapus ulasan dari ${username}?`)) {
      return;
    }
    try {
      await deleteReview(id);
      toast.success('Ulasan berhasil dihapus.');
      loadReviews();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openReplyModal = (review: AdminReview) => {
    setActiveReview(review);
    setReplyText(review.adminReply || '');
    setIsModalOpen(true);
  };

  const closeReplyModal = () => {
    setIsModalOpen(false);
    setActiveReview(null);
    setReplyText('');
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;
    setSubmitting(true);
    try {
      await replyToReview(activeReview.id, replyText);
      toast.success(replyText ? 'Balasan berhasil disimpan.' : 'Balasan berhasil dihapus.');
      closeReplyModal();
      loadReviews();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-white">Moderasi Ulasan</h1>
          <p className="mt-1 text-[13px] text-[#666]">Kelola dan moderasi ulasan aplikasi dari user</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Rating Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                setPage(1);
              }}
              className="h-10 cursor-pointer appearance-none rounded-full border border-white/[0.06] bg-[#111] pl-9 pr-8 text-[13px] text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="ALL">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'newest' | 'oldest');
              setPage(1);
            }}
            className="h-10 cursor-pointer appearance-none rounded-full border border-white/[0.06] bg-[#111] px-4 text-[13px] text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-4 font-medium text-[#888] w-[20%]">User</th>
                <th className="px-5 py-4 font-medium text-[#888] w-[15%]">Rating</th>
                <th className="px-5 py-4 font-medium text-[#888] w-[45%]">Ulasan</th>
                <th className="px-5 py-4 font-medium text-[#888] w-[10%]">Tanggal</th>
                <th className="px-5 py-4 font-medium text-[#888] w-[10%] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading && reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#666]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Memuat ulasan...
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#666]">
                    Tidak ada ulasan yang ditemukan.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                          {r.user.avatar ? (
                            <img src={r.user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            r.user.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{r.user.username}</p>
                          <p className="truncate text-[11px] text-[#666]">{r.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-current' : 'text-white/10'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-3">
                        <p className="text-[13px] leading-relaxed text-[#ccc]">{r.review}</p>
                        
                        {r.adminReply && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-[14px] text-primary">forum</span>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Balasan Admin</span>
                              <span className="text-[10px] text-[#666] ml-auto">
                                {new Date(r.repliedAt!).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-[12px] text-[#aaa]">{r.adminReply}</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-[#888]">
                      {new Date(r.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openReplyModal(r)}
                          className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                          title="Balas Ulasan"
                        >
                          <MessageCircleReply className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.user.username)}
                          className="rounded-lg p-2 text-[#666] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Hapus Ulasan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* Reply Modal */}
      {mounted && isModalOpen && activeReview && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#1a1a1a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Balas Ulasan</h2>
              <button onClick={closeReplyModal} className="text-[#666] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent p-5 border border-white/[0.08] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[13px] font-bold text-primary">
                  {activeReview.user.avatar ? (
                    <img src={activeReview.user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    activeReview.user.username[0].toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-[14px]">{activeReview.user.username}</div>
                  <div className="flex text-yellow-400 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < activeReview.rating ? 'fill-current' : 'text-white/10'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[14px] leading-relaxed text-[#ddd] italic">"{activeReview.review}"</p>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#888]">
                  Balasan Anda <span className="text-[#555]">(Kosongkan untuk menghapus balasan)</span>
                </label>
                <div className="flex flex-col rounded-xl border border-white/[0.06] bg-[#111] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-inner overflow-hidden">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full resize-none bg-transparent p-4 text-[13px] text-white focus:outline-none"
                    placeholder="Ketik balasan di sini..."
                  />
                  {/* Quick Emojis Block */}
                  <div className="flex items-center gap-1 overflow-x-auto border-t border-white/[0.04] bg-white/[0.01] px-3 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {['🙏', '👍', '😊', '🔥', '🎵', '💚', '✨', '🙌', '💯', '🎧'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setReplyText((prev) => prev + emoji)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 text-[15px] transition-colors"
                        title={`Tambahkan emoji ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReplyModal}
                  className="rounded-full px-5 py-2 text-[13px] font-bold text-white hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-5 py-2 text-[13px] font-bold text-black hover:scale-105 active:scale-95 disabled:opacity-50 transition-transform"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Balasan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
