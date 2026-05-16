'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Music, Quote, Star, Users } from 'lucide-react';
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

export function LandingPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [reviewMeta, setReviewMeta] = useState<ReviewMeta>({});
  const [isReviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');

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

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const reviewStats = useMemo(() => {
    const total = reviewMeta.total || 0;
    const averageRating = reviewMeta.averageRating || 0;
    const highestRating = reviews.reduce((highest, item) => Math.max(highest, item.rating), 0);

    return [
      { value: total > 0 ? `${averageRating.toFixed(1)}/5` : '0/5', label: 'Rating pengguna' },
      { value: String(total), label: 'Ulasan masuk' },
      { value: highestRating > 0 ? `${highestRating}/5` : '0/5', label: 'Rating tertinggi' },
    ];
  }, [reviewMeta, reviews]);

  const loginRedirectHref = `/login?redirect=${encodeURIComponent('/reviews')}`;
  const reviewActionHref = user ? '/reviews' : loginRedirectHref;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background antialiased">
      {/* Navigasi utama di landing page */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md shadow-md">
        <div className="flex justify-between items-center px-4 py-4 sm:px-6 md:px-8 max-w-[1440px] mx-auto">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">Soundwave</Link>
          <div className="hidden md:flex gap-8 items-center text-sm font-bold">
            <Link href="#" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Tentang Kami</Link>
            <Link href="#" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Dukungan</Link>
            <Link href="/discover" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Cari Musik</Link>
            <span className="w-px h-6 bg-border mx-3" />
            {user ? (
              <>
                <Link href="/" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Beranda</Link>
                <Link href="/reviews" className="bg-primary text-primary-foreground text-sm font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform tracking-[1.8px]">
                  BERI ULASAN
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Daftar</Link>
                <Link href={loginRedirectHref} className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Masuk</Link>
                <Link href="/register" className="bg-primary text-primary-foreground text-sm font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform tracking-[1.8px]">
                  MULAI SEKARANG
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 md:hidden">
            {user ? (
              <Link href="/" className="flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-black">
                Beranda
              </Link>
            ) : (
              <>
                <Link href={loginRedirectHref} className="flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-foreground">
                  Masuk
                </Link>
                <Link href="/register" className="flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-black">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {/* Bagian utama landing page */}
        <section className="relative flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center overflow-hidden py-16">
          <div className="absolute inset-0 z-0 bg-background">
            <img alt="Abstract dark sound waves background" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE73-H7Zw2GiJW4R7VZZsMVZFqk0R5mtuV44PK__EAu9HfatUgKulhkR3KpJoCfVMMhlgBBr7qUENctX_8KPLo2VXioCEnlUmlsznMT9qPEljKHGZDQdBdeSldN_RYt8Lx-u1w9VrcZVW9Ojha2nqNR_hquyeVXcS_q3MzrtSqKivD5awt_5r0U9q6-fJyiPKjA8Ak8x0QdYRA8HD2X7lkQN87Ic68S4RSlPdcdO8LNs5rDW-QOy7n5lPxQ_PPyys53vgrhYmCCUQ" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-7xl">
              Dengarkan musik tanpa batas.
            </h1>
            <p className="text-base text-[#B3B3B3] max-w-2xl mt-3">
              Putar Ratusan Lagu Gratis Sekarang!
            </p>
            <Link href={user ? '/reviews' : '/register'} className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-center text-sm font-bold tracking-[1.2px] text-primary-foreground shadow-[0_8px_24px_rgba(30,215,96,0.2)] transition-transform hover:scale-105 sm:px-8 sm:py-4 sm:tracking-[1.8px]">
              {user ? 'BAGIKAN ULASAN' : 'DAPATKAN SOUNDWAVE GRATIS'}
            </Link>
          </div>
        </section>

        {/* Ringkasan fitur utama */}
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 md:px-8 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1e2020] rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 hover:bg-[#252525] transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-[#38393a] flex items-center justify-center mb-3">
                <Music className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Musik untuk setiap suasana</h3>
              <p className="text-base text-[#B3B3B3]">Dengarkan playlist yang sesuai dengan mood kamu, kapan saja.</p>
            </div>
            <div className="bg-[#1e2020] rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 hover:bg-[#252525] transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-[#38393a] flex items-center justify-center mb-3">
                <div className="text-primary font-bold text-xl">HQ</div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Kualitas suara premium</h3>
              <p className="text-base text-[#B3B3B3]">Nikmati audio sejernih kristal untuk pengalaman mendengarkan terbaik.</p>
            </div>
            <div className="bg-[#1e2020] rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 hover:bg-[#252525] transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-[#38393a] flex items-center justify-center mb-3">
                <div className="w-8 h-8 border-2 border-primary rounded-sm" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Putar di mana saja</h3>
              <p className="text-base text-[#B3B3B3]">Streaming musik favorit Anda di ponsel, tablet, atau desktop dengan lancar.</p>
            </div>
          </div>
        </section>

        {/* Cerita singkat dari pendengar yang sudah mencoba Soundwave */}
        <section id="reviews" className="scroll-mt-24 border-y border-white/5 bg-[#101111]">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 md:px-8 md:py-24 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                <Users className="h-4 w-4" aria-hidden="true" />
                Dipercaya pendengar harian
              </div>
              <div>
                <h2 className="max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  Rating dan ulasan dari komunitas Soundwave.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#B3B3B3]">
                  Ulasan di bagian ini tersimpan di database Soundwave dan ditampilkan dari API secara langsung.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-xl">
                {reviewStats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-white/10 bg-[#181818] p-4">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="mt-1 text-sm text-[#B3B3B3]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-white/10 bg-[#181818] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {user ? 'Beri ulasan dari halaman aplikasi' : 'Masuk untuk memberi ulasan'}
                    </h3>
                    <p className="text-sm text-[#B3B3B3]">
                      {user
                        ? 'Form rating kini tersedia di menu sidebar agar lebih mudah ditemukan.'
                        : 'Kami menyimpan ulasan berdasarkan akun supaya tidak ada data ganda.'}
                    </p>
                  </div>
                </div>
                {reviewError ? (
                  <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                    {reviewError}
                  </p>
                ) : null}
                <Link href={reviewActionHref} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-black transition-transform hover:scale-[1.01]">
                  {user ? 'Buka halaman ulasan' : 'Masuk dan beri ulasan'}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
              {isReviewsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="min-h-[260px] animate-pulse rounded-lg border border-white/10 bg-[#181818]" />
                ))
              ) : reviews.length > 0 ? (
                reviews.map((item) => (
                  <article
                    key={item.id}
                    className="flex min-h-[260px] flex-col justify-between rounded-lg border border-white/10 bg-[#181818] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-colors duration-200 hover:border-primary/40 hover:bg-[#202121]"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 text-[#F5C451]" aria-label={`${item.rating} dari 5 bintang`}>
                          {Array.from({ length: item.rating }).map((_, index) => (
                            <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                          ))}
                        </div>
                        <Quote className="h-6 w-6 text-primary/70" aria-hidden="true" />
                      </div>
                      <p className="text-base leading-7 text-[#E7E7E7]">
                        &ldquo;{item.review}&rdquo;
                      </p>
                    </div>
                    <div className="mt-8 border-t border-white/10 pt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{item.user.username}</h3>
                        {item.user.id === user?.id ? (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                            Ulasan kamu
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[#B3B3B3]">Pendengar Soundwave</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-white/10 bg-[#181818] p-6 text-sm leading-6 text-[#B3B3B3] md:col-span-3">
                  Belum ada ulasan. Jadilah pendengar pertama yang membagikan pengalaman memakai Soundwave.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer landing page */}
      <footer className="bg-[#0d0e0f] w-full py-8 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-primary mb-4">Soundwave</div>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-base">PERUSAHAAN</h4>
            <ul className="flex flex-col gap-1 text-sm">
              <li><Link className="text-[#B3B3B3] hover:text-foreground hover:underline transition-opacity duration-200" href="#">Tentang</Link></li>
              <li><Link className="text-[#B3B3B3] hover:text-foreground hover:underline transition-opacity duration-200" href="#">Pekerjaan</Link></li>
              <li><Link className="text-[#B3B3B3] hover:text-foreground hover:underline transition-opacity duration-200" href="#">For the Record</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-base">KOMUNITAS</h4>
            <ul className="flex flex-col gap-1 text-sm">
              <li><Link className="text-[#B3B3B3] hover:text-foreground hover:underline transition-opacity duration-200" href="#">Developer</Link></li>
              <li><Link className="text-[#B3B3B3] hover:text-foreground hover:underline transition-opacity duration-200" href="#">Investor</Link></li>
              <li><Link className="text-[#B3B3B3] hover:text-foreground hover:underline transition-opacity duration-200" href="#">Vendor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3 text-base">TAUTAN BERGUNA</h4>
            <ul className="flex flex-col gap-1 text-sm">
              <li><Link className="text-[#B3B3B3] hover:text-foreground hover:underline transition-opacity duration-200" href="#">Dukungan</Link></li>
              <li><Link className="text-[#B3B3B3] hover:text-foreground hover:underline transition-opacity duration-200" href="#">Aplikasi Mobile</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-6 border-t border-border/50 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <span className="text-sm text-[#B3B3B3]">&copy; 2024 Soundwave. Musik untuk setiap momen.</span>
        </div>
      </footer>
    </div>
  );
}
