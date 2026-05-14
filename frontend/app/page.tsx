'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MusicCard } from '@/components/MusicCard';
import Link from 'next/link';
import { Loader, Music, Search, ListMusic, Heart } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { trendingSongs, isTrendingLoading, getTrendingSongs } = useMusic();

  useEffect(() => {
    getTrendingSongs();
  }, [getTrendingSongs]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {!user ? (
        /* Landing Page View */
        <div className="flex flex-col h-full overflow-y-auto antialiased">
          {/* TopNavBar */}
          <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md shadow-md">
            <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
              <div className="text-2xl font-bold tracking-tighter text-primary">Soundwave</div>
              <div className="hidden md:flex gap-8 items-center text-sm font-bold">
                <Link href="#" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Tentang Kami</Link>
                <Link href="#" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Dukungan</Link>
                <Link href="/discover" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Cari Musik</Link>
                <span className="w-px h-6 bg-border mx-3"></span>
                <Link href="/register" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Daftar</Link>
                <Link href="/login" className="text-foreground hover:text-primary transition-all active:scale-95 duration-200">Masuk</Link>
                <Link href="/register" className="bg-primary text-primary-foreground text-sm font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform tracking-[1.8px]">
                  MULAI SEKARANG
                </Link>
              </div>
            </div>
          </nav>

          <main className="flex-grow pt-24">
            {/* Hero Section */}
            <section className="relative w-full h-[819px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0 bg-background">
                <img alt="Abstract dark sound waves background" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE73-H7Zw2GiJW4R7VZZsMVZFqk0R5mtuV44PK__EAu9HfatUgKulhkR3KpJoCfVMMhlgBBr7qUENctX_8KPLo2VXioCEnlUmlsznMT9qPEljKHGZDQdBdeSldN_RYt8Lx-u1w9VrcZVW9Ojha2nqNR_hquyeVXcS_q3MzrtSqKivD5awt_5r0U9q6-fJyiPKjA8Ak8x0QdYRA8HD2X7lkQN87Ic68S4RSlPdcdO8LNs5rDW-QOy7n5lPxQ_PPyys53vgrhYmCCUQ" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
              </div>
              <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                  Dengarkan musik tanpa batas.
                </h1>
                <p className="text-base text-[#B3B3B3] max-w-2xl mt-3">
                  Jutaan lagu dan podcast. Tanpa kartu kredit.
                </p>
                <Link href="/register" className="mt-6 bg-primary text-primary-foreground text-sm font-bold tracking-[1.8px] py-4 px-8 rounded-full hover:scale-105 transition-transform shadow-[0_8px_24px_rgba(30,215,96,0.2)]">
                  DAPATKAN SOUNDWAVE GRATIS
                </Link>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-[#1e2020] rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 hover:bg-[#252525] transition-colors duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#38393a] flex items-center justify-center mb-3">
                    <Music className="text-primary h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Musik untuk setiap suasana</h3>
                  <p className="text-base text-[#B3B3B3]">Dengarkan playlist yang sesuai dengan mood kamu, kapan saja.</p>
                </div>
                {/* Feature 2 */}
                <div className="bg-[#1e2020] rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 hover:bg-[#252525] transition-colors duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#38393a] flex items-center justify-center mb-3">
                    <div className="text-primary font-bold text-xl">HQ</div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Kualitas suara premium</h3>
                  <p className="text-base text-[#B3B3B3]">Nikmati audio sejernih kristal untuk pengalaman mendengarkan terbaik.</p>
                </div>
                {/* Feature 3 */}
                <div className="bg-[#1e2020] rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 hover:bg-[#252525] transition-colors duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#38393a] flex items-center justify-center mb-3">
                    <div className="w-8 h-8 border-2 border-primary rounded-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Putar di mana saja</h3>
                  <p className="text-base text-[#B3B3B3]">Streaming musik favorit Anda di ponsel, tablet, atau desktop dengan lancar.</p>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="bg-[#0d0e0f] w-full py-8 border-t border-border">
            <div className="max-w-[1440px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
            <div className="max-w-[1440px] mx-auto px-8 pt-6 border-t border-border/50 flex justify-between items-center">
              <span className="text-sm text-[#B3B3B3]">© 2024 Soundwave. Musik untuk setiap momen.</span>
            </div>
          </footer>
        </div>
      ) : (
        /* Authenticated Home View */
        <>
          <Header title="Welcome to SoundWave" />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {/* Trending Section */}
              <section className="mb-12">
                <div className="mb-6">
                  <h2 className="text-3xl font-black text-foreground tracking-tighter">Trending Now</h2>
                  <p className="text-text-secondary font-medium">Check out what&apos;s hot right now</p>
                </div>

                {isTrendingLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader className="h-8 w-8 animate-spin text-spotify-green" />
                  </div>
                ) : trendingSongs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {trendingSongs.slice(0, 10).map((song) => (
                      <MusicCard key={song.musicId} song={song} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[2rem] border-2 border-dashed border-border p-12 text-center">
                    <p className="text-text-secondary font-medium">No trending songs available</p>
                  </div>
                )}
              </section>

              {/* Quick Links */}
              <section className="mb-12">
                <h2 className="mb-6 text-2xl font-black text-foreground tracking-tighter uppercase">Get Started</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <Link
                    href="/discover"
                    className="group rounded-[2rem] border border-border/50 bg-surface-interactive p-8 hover:border-spotify-green transition-all duration-300"
                  >
                    <div className="h-12 w-12 bg-spotify-green/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Search className="text-spotify-green" />
                    </div>
                    <h3 className="mb-2 text-xl font-black text-foreground">Discover Music</h3>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">Explore new songs and artists</p>
                  </Link>
                  <Link
                    href="/playlists"
                    className="group rounded-[2rem] border border-border/50 bg-surface-interactive p-8 hover:border-spotify-green transition-all duration-300"
                  >
                    <div className="h-12 w-12 bg-spotify-green/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <ListMusic className="text-spotify-green" />
                    </div>
                    <h3 className="mb-2 text-xl font-black text-foreground">Your Playlists</h3>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">Create and manage playlists</p>
                  </Link>
                  <Link
                    href="/favorites"
                    className="group rounded-[2rem] border border-border/50 bg-surface-interactive p-8 hover:border-spotify-green transition-all duration-300"
                  >
                    <div className="h-12 w-12 bg-spotify-green/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Heart className="text-spotify-green" />
                    </div>
                    <h3 className="mb-2 text-xl font-black text-foreground">Favorites</h3>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">Your liked songs collection</p>
                  </Link>
                </div>
              </section>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
