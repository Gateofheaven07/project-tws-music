import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Headphones, HeartHandshake, Music2, Radio, ShieldCheck, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Kami - Soundwave',
  description: 'Kenali Soundwave, platform musik untuk menemukan lagu, suasana, dan komunitas pendengar.',
};

const values = [
  {
    title: 'Mudah ditemukan',
    description: 'Musik, genre, dan rekomendasi dibuat mudah dijelajahi tanpa alur yang rumit.',
    icon: Compass,
  },
  {
    title: 'Dekat dengan pendengar',
    description: 'Ulasan dan rating pengguna membantu Soundwave terus memahami pengalaman mendengarkan sehari-hari.',
    icon: Users,
  },
  {
    title: 'Fokus ke kualitas',
    description: 'Tampilan, pencarian, dan pemutaran dirancang agar pendengar bisa langsung menikmati musik.',
    icon: ShieldCheck,
  },
];

const features = [
  'Jelajahi genre dan lagu populer dari satu tempat.',
  'Simpan musik favorit untuk didengar kembali.',
  'Bagikan rating dan ulasan setelah memakai Soundwave.',
  'Nikmati pengalaman responsif di desktop dan perangkat mobile.',
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <nav className="fixed top-0 z-50 w-full bg-card/80 shadow-md backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 md:px-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
            Soundwave
          </Link>
          <div className="hidden items-center gap-8 text-sm font-bold md:flex">
            <Link href="/tentang-kami" className="text-primary transition-colors">
              Tentang Kami
            </Link>
            <Link href="/dukungan" className="text-foreground transition-colors hover:text-primary">
              Dukungan
            </Link>
            <Link href="/discover" className="text-foreground transition-colors hover:text-primary">
              Cari Musik
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden min-h-11 items-center rounded-full px-4 text-sm font-bold text-foreground transition-colors hover:text-primary sm:flex">
              Masuk
            </Link>
            <Link href="/register" className="flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-black transition-transform hover:scale-105 sm:px-5">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative flex min-h-[calc(92dvh-5rem)] items-center overflow-hidden py-16">
          <div className="hero-wave-background absolute inset-0 z-0 bg-background">
            <img
              alt="Abstract dark sound waves background"
              className="hero-wave-image h-full w-full object-cover opacity-35 mix-blend-luminosity"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE73-H7Zw2GiJW4R7VZZsMVZFqk0R5mtuV44PK__EAu9HfatUgKulhkR3KpJoCfVMMhlgBBr7qUENctX_8KPLo2VXioCEnlUmlsznMT9qPEljKHGZDQdBdeSldN_RYt8Lx-u1w9VrcZVW9Ojha2nqNR_hquyeVXcS_q3MzrtSqKivD5awt_5r0U9q6-fJyiPKjA8Ak8x0QdYRA8HD2X7lkQN87Ic68S4RSlPdcdO8LNs5rDW-QOy7n5lPxQ_PPyys53vgrhYmCCUQ"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-10 px-4 sm:px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                <Radio className="h-4 w-4" aria-hidden="true" />
                Tentang Soundwave
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
                Musik yang mudah ditemukan, dekat dengan pendengarnya.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#B3B3B3] sm:text-lg">
                Soundwave dibuat untuk membantu pendengar menemukan lagu, menikmati suasana, dan membagikan pengalaman musik dari satu tempat yang sederhana.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-black transition-transform hover:scale-[1.02]">
                  Mulai sekarang
                </Link>
                <Link href="/discover" className="flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-bold text-white transition-colors hover:border-primary hover:text-primary">
                  Cari musik
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border border-white/10 bg-[#181818]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-md">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Headphones className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#B3B3B3]">Fokus produk</p>
                  <h2 className="text-xl font-bold text-white">Dengarkan tanpa distraksi</h2>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[#101111] p-4">
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="mt-1 text-sm text-[#B3B3B3]">Akses musik kapan saja</p>
                </div>
                <div className="rounded-lg bg-[#101111] p-4">
                  <p className="text-2xl font-bold text-white">5/5</p>
                  <p className="mt-1 text-sm text-[#B3B3B3]">Sistem rating pengguna</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-[#B3B3B3]">
                Kami menjaga pengalaman tetap ringkas: temukan musik, putar lagu, simpan favorit, lalu bagikan ulasan ketika sudah mencoba.
              </p>
            </div>
          </div>
        </section>

        <section id="misi" className="border-y border-white/5 bg-[#101111]">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 md:px-8 md:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Music2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">Misi kami</h2>
            </div>
            <div className="grid gap-5 text-base leading-7 text-[#B3B3B3]">
              <p>
                Soundwave ingin membuat pengalaman mendengarkan terasa langsung dan personal. Pendengar bisa berpindah dari pencarian, rekomendasi, favorit, sampai ulasan tanpa kehilangan konteks.
              </p>
              <p>
                Kami percaya aplikasi musik yang baik tidak hanya memutar lagu. Aplikasi juga perlu membantu pengguna menemukan suasana, membangun kebiasaan mendengarkan, dan memberi ruang untuk masukan komunitas.
              </p>
            </div>
          </div>
        </section>

        <section id="nilai" className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 md:px-8 md:py-24">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Nilai yang kami jaga</h2>
            <p className="mt-4 text-base leading-7 text-[#B3B3B3]">
              Setiap fitur Soundwave diarahkan untuk membuat pengalaman musik terasa praktis, jelas, dan nyaman dipakai berulang.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article key={value.title} className="rounded-lg border border-white/10 bg-[#181818] p-6 transition-colors hover:border-primary/40 hover:bg-[#202121]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{value.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#B3B3B3]">{value.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-[#0d0e0f]">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 md:px-8 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                Dibangun untuk pendengar
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">Yang bisa kamu lakukan di Soundwave</h2>
            </div>
            <div className="grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 rounded-lg border border-white/10 bg-[#181818] p-4">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <p className="text-sm leading-6 text-[#E7E7E7]">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
