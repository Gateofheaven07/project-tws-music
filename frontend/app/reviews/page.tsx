'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader, MessageSquare, Quote, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api, { getApiErrorMessage } from '@/lib/api';

type ReviewUser = {
  id: string;
  username: string;
  avatar?: string | null;
};

type AppReview = {
  id: string;
  rating: number;
  review: string;
  user: ReviewUser;
  createdAt: string;
  updatedAt: string;
};

type ReviewMeta = {
  total?: number;
  averageRating?: number;
};

export default function ReviewsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [reviewMeta, setReviewMeta] = useState<ReviewMeta>({});
  const [myReview, setMyReview] = useState<AppReview | null>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isReviewsLoading, setReviewsLoading] = useState(true);
  const [isMyReviewLoading, setMyReviewLoading] = useState(false);
  const [isSavingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/login?redirect=/reviews');
    }
  }, [router, user]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const response = await api.get('/reviews');
      setReviews(response.data.results || []);
      setReviewMeta(response.data.meta || {});
    } catch (error) {
      setReviews([]);
      setReviewMeta({});
      setReviewError(getApiErrorMessage(error, 'Ulasan belum bisa dimuat.'));
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const fetchMyReview = useCallback(async () => {
    if (!user || !accessToken) return;

    setMyReviewLoading(true);
    try {
      const response = await api.get('/reviews/me');
      const review = response.data.data || null;
      setMyReview(review);
      setSelectedRating(review?.rating || 5);
      setReviewText(review?.review || '');
    } catch (error) {
      setMyReview(null);
      setReviewError(getApiErrorMessage(error, 'Ulasan kamu belum bisa dimuat.'));
    } finally {
      setMyReviewLoading(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetchMyReview();
  }, [fetchMyReview]);

  const reviewStats = useMemo(() => {
    const total = reviewMeta.total || 0;
    const averageRating = reviewMeta.averageRating || 0;

    return [
      { value: total > 0 ? `${averageRating.toFixed(1)}/5` : '0/5', label: 'Rating rata-rata' },
      { value: String(total), label: 'Total ulasan' },
      { value: myReview ? `${myReview.rating}/5` : '-', label: 'Rating kamu' },
    ];
  }, [myReview, reviewMeta]);

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !accessToken) {
      router.push('/login?redirect=/reviews');
      return;
    }

    const trimmedReview = reviewText.trim();
    if (trimmedReview.length < 12) {
      setReviewSuccess('');
      setReviewError('Ulasan terlalu singkat. Ceritakan sedikit pengalaman kamu.');
      return;
    }

    setSavingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const response = await api.put('/reviews/me', {
        rating: selectedRating,
        review: trimmedReview,
      });

      const savedReview = response.data.data || null;
      setMyReview(savedReview);
      setSelectedRating(savedReview?.rating || selectedRating);
      setReviewText(savedReview?.review || trimmedReview);
      setReviewSuccess(myReview ? 'Ulasan kamu berhasil diperbarui.' : 'Terima kasih. Ulasan kamu sudah tersimpan.');
      await fetchReviews();
    } catch (error) {
      setReviewError(getApiErrorMessage(error, 'Ulasan kamu belum bisa disimpan.'));
    } finally {
      setSavingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="rounded-lg border border-white/10 bg-[#181818] p-6 text-center">
          <Loader className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-[#b3b3b3]">Mengarah ke halaman masuk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#1F2937]/25 to-background">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pb-36 pt-6 sm:px-5 md:px-8 md:pb-28">
        <header className="flex flex-col gap-3">
          <Link href="/" className="text-sm font-bold text-[#b3b3b3] transition-colors hover:text-white">
            Kembali ke Beranda
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Beri Rating & Ulasan
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b3b3b3] md:text-base">
              Bagikan pengalaman kamu memakai Soundwave. Satu akun punya satu ulasan aktif dan bisa diperbarui kapan saja.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {reviewStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/10 bg-[#181818] p-5">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-[#b3b3b3]">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-lg border border-white/10 bg-[#181818] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {myReview ? 'Perbarui ulasan kamu' : 'Tulis ulasan kamu'}
                </h2>
                <p className="text-sm text-[#b3b3b3]">Ulasan akan tampil sebagai {user.username}.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-5">
              <div>
                <span className="text-sm font-bold text-white">Rating</span>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Pilih rating">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const ratingValue = index + 1;
                    const isSelected = selectedRating === ratingValue;

                    return (
                      <button
                        key={ratingValue}
                        type="button"
                        onClick={() => setSelectedRating(ratingValue)}
                        className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${
                          isSelected
                            ? 'border-primary bg-primary text-black'
                            : 'border-white/10 bg-[#101111] text-[#F5C451] hover:border-primary/60'
                        }`}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${ratingValue} dari 5 bintang`}
                        disabled={isMyReviewLoading || isSavingReview}
                      >
                        <Star className={`h-5 w-5 ${ratingValue <= selectedRating ? 'fill-current' : ''}`} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="review-text" className="text-sm font-bold text-white">
                  Ulasan
                </label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  className="mt-2 min-h-36 w-full resize-none rounded-lg border border-white/10 bg-[#101111] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-[#777] focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Ceritakan pengalaman kamu menggunakan Soundwave"
                  maxLength={180}
                  disabled={isMyReviewLoading || isSavingReview}
                />
                <div className="mt-2 flex justify-between gap-3 text-xs text-[#b3b3b3]">
                  <span>Minimal 12 karakter.</span>
                  <span>{reviewText.length}/180</span>
                </div>
              </div>

              {reviewError ? (
                <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                  {reviewError}
                </p>
              ) : null}

              {reviewSuccess ? (
                <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary" role="status">
                  {reviewSuccess}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isMyReviewLoading || isSavingReview}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-black transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingReview ? <Loader className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {isSavingReview ? 'Menyimpan...' : myReview ? 'Perbarui ulasan' : 'Kirim ulasan'}
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-white/10 bg-[#181818] p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Ulasan Pendengar</h2>
                <p className="mt-1 text-sm text-[#b3b3b3]">Daftar ulasan terbaru dari pengguna Soundwave.</p>
              </div>
            </div>

            {isReviewsLoading ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="min-h-[220px] animate-pulse rounded-lg border border-white/10 bg-[#101111]" />
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {reviews.map((item) => (
                  <article
                    key={item.id}
                    className="flex min-h-[220px] flex-col justify-between rounded-lg border border-white/10 bg-[#101111] p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 text-[#F5C451]" aria-label={`${item.rating} dari 5 bintang`}>
                          {Array.from({ length: item.rating }).map((_, index) => (
                            <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                          ))}
                        </div>
                        <Quote className="h-5 w-5 text-primary/70" aria-hidden="true" />
                      </div>
                      <p className="text-sm leading-6 text-[#E7E7E7]">
                        &ldquo;{item.review}&rdquo;
                      </p>
                    </div>
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{item.user.username}</h3>
                        {item.user.id === user.id ? (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                            Ulasan kamu
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-[#b3b3b3]">Pendengar Soundwave</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-[#101111] p-6 text-sm leading-6 text-[#b3b3b3]">
                Belum ada ulasan. Kamu bisa jadi pendengar pertama yang membagikan pengalaman memakai Soundwave.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
