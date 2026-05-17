import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleHelp, Headphones, Heart, LifeBuoy, LockKeyhole, Mail, MessageSquare, Search, Settings, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dukungan - Soundwave',
  description: 'Pusat bantuan Soundwave untuk akun, pencarian musik, favorit, ulasan, dan pengalaman mendengarkan.',
};

const helpTopics = [
  {
    title: 'Akun dan akses',
    description: 'Bantuan untuk masuk, daftar, dan mengakses kembali akun Soundwave.',
    icon: LockKeyhole,
  },
  {
    title: 'Cari musik',
    description: 'Tips menemukan lagu berdasarkan kata kunci, genre, dan rekomendasi.',
    icon: Search,
  },
  {
    title: 'Favorit dan pemutaran',
    description: 'Panduan menyimpan lagu favorit dan menjaga antrean pemutaran tetap nyaman.',
    icon: Headphones,
  },
  {
    title: 'Rating dan ulasan',
    description: 'Cara menulis, memperbarui, dan melihat ulasan dari komunitas Soundwave.',
    icon: MessageSquare,
  },
];

const faqs = [
  {
    question: 'Apakah Soundwave bisa digunakan tanpa akun?',
    answer: 'Halaman publik bisa dibuka tanpa akun. Untuk menyimpan favorit dan memberi ulasan, pengguna perlu masuk terlebih dahulu.',
  },
  {
    question: 'Bagaimana cara mencari lagu?',
    answer: 'Buka halaman Cari Musik, lalu gunakan kolom pencarian atau pilih genre yang tersedia untuk melihat daftar lagu.',
  },
  {
    question: 'Kenapa ulasan saya perlu akun?',
    answer: 'Ulasan disimpan berdasarkan akun agar setiap pengguna punya satu ulasan aktif yang bisa diperbarui kapan saja.',
  },
  {
    question: 'Apa yang perlu dilakukan jika musik tidak muncul?',
    answer: 'Coba muat ulang halaman, pastikan koneksi stabil, lalu cari dengan kata kunci atau genre lain.',
  },
];

const quickActions = [
  { label: 'Buka Cari Musik', href: '/discover' },
  { label: 'Masuk ke akun', href: '/login' },
  { label: 'Buat akun baru', href: '/register' },
];

export default function SupportPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <nav className="fixed top-0 z-50 w-full bg-card/80 shadow-md backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 md:px-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
            Soundwave
          </Link>
          <div className="hidden items-center gap-8 text-sm font-bold md:flex">
            <Link href="/tentang-kami" className="text-foreground transition-colors hover:text-primary">
              Tentang Kami
            </Link>
            <Link href="/dukungan" className="text-primary transition-colors">
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
        <section className="relative overflow-hidden border-b border-white/5 bg-[#101111]">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(30,215,96,0.13),transparent_42%),linear-gradient(0deg,rgba(18,18,18,1),rgba(18,18,18,0.72))]" />
          <div className="relative mx-auto grid min-h-[calc(82dvh-5rem)] max-w-[1440px] gap-10 px-4 py-16 sm:px-6 md:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                <LifeBuoy className="h-4 w-4" aria-hidden="true" />
                Pusat Dukungan
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
                Bantuan untuk pengalaman mendengarkan yang lancar.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#B3B3B3] sm:text-lg">
                Temukan panduan akun, pencarian musik, favorit, dan ulasan. Semua informasi awal dikumpulkan agar kamu cepat kembali mendengarkan.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all ${
                      index === 0
                        ? 'bg-primary text-black hover:scale-[1.02]'
                        : 'border border-white/15 text-white hover:border-primary hover:text-primary'
                    }`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#181818] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
              <div className="flex items-start gap-4 border-b border-white/10 pb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CircleHelp className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Mulai dari sini</h2>
                  <p className="mt-2 text-sm leading-6 text-[#B3B3B3]">
                    Pilih topik bantuan yang paling sesuai, lalu cek jawaban cepat di bagian FAQ.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="flex items-center gap-3 rounded-lg bg-[#101111] p-4">
                  <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="text-sm font-bold text-white">Periksa status akun dan koneksi.</p>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[#101111] p-4">
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="text-sm font-bold text-white">Coba pencarian atau genre lain.</p>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[#101111] p-4">
                  <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="text-sm font-bold text-white">Masuk untuk menyimpan favorit dan ulasan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="komunitas" className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 md:px-8 md:py-24">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Topik bantuan</h2>
            <p className="mt-4 text-base leading-7 text-[#B3B3B3]">
              Gunakan bagian ini sebagai titik awal sebelum menghubungi tim dukungan.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {helpTopics.map((topic) => {
              const Icon = topic.icon;

              return (
                <article key={topic.title} className="rounded-lg border border-white/10 bg-[#181818] p-6 transition-colors hover:border-primary/40 hover:bg-[#202121]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{topic.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#B3B3B3]">{topic.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-white/5 bg-[#101111]">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 md:px-8 md:py-20 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CircleHelp className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">FAQ</h2>
              <p className="mt-4 text-base leading-7 text-[#B3B3B3]">
                Jawaban cepat untuk pertanyaan yang paling sering muncul.
              </p>
            </div>
            <div className="grid gap-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-lg border border-white/10 bg-[#181818] p-5">
                  <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#B3B3B3]">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="kontak" className="bg-[#0d0e0f]">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 md:px-8 md:py-20 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Butuh bantuan lanjutan?</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#B3B3B3]">
                Kirim detail masalah, langkah yang sudah dicoba, dan perangkat yang digunakan agar tim dukungan bisa menindaklanjuti lebih cepat.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#181818] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Kontak dukungan</h3>
                  <p className="mt-2 text-sm leading-6 text-[#B3B3B3]">
                    Email: support@soundwave.id
                  </p>
                  <Link href="/login" className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-black transition-transform hover:scale-[1.01] sm:w-fit">
                    Masuk untuk lanjut
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
