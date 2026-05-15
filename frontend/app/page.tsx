'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { MusicCard } from '@/components/MusicCard';
import { GenreCard } from '@/components/GenreCard';
import Link from 'next/link';
import { Loader, Music } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const {
    trendingSongs,
    isTrendingLoading,
    getTrendingSongs,
    genres,
    isGenresLoading,
    genresError,
    getGenres,
  } = useMusic();

  useEffect(() => {
    if (!user) return;

    getTrendingSongs();
    getGenres();
  }, [user, getTrendingSongs, getGenres]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {!user ? (
        /* Tampilan awal untuk pengunjung yang belum masuk */
        <div className="flex flex-col h-full overflow-y-auto antialiased">
          {/* Navigasi utama di landing page */}
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
            {/* Bagian utama landing page */}
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

            {/* Ringkasan fitur utama */}
            <section className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Fitur suasana */}
                <div className="bg-[#1e2020] rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 hover:bg-[#252525] transition-colors duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#38393a] flex items-center justify-center mb-3">
                    <Music className="text-primary h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Musik untuk setiap suasana</h3>
                  <p className="text-base text-[#B3B3B3]">Dengarkan playlist yang sesuai dengan mood kamu, kapan saja.</p>
                </div>
                {/* Fitur kualitas audio */}
                <div className="bg-[#1e2020] rounded-[2rem] p-8 flex flex-col items-center text-center gap-4 hover:bg-[#252525] transition-colors duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#38393a] flex items-center justify-center mb-3">
                    <div className="text-primary font-bold text-xl">HQ</div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Kualitas suara premium</h3>
                  <p className="text-base text-[#B3B3B3]">Nikmati audio sejernih kristal untuk pengalaman mendengarkan terbaik.</p>
                </div>
                {/* Fitur lintas perangkat */}
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

          {/* Footer landing page */}
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
        /* Tampilan beranda setelah pengguna masuk */
        <div className="flex-1 relative flex flex-col h-full bg-gradient-to-b from-[#1F2937]/30 to-background overflow-y-auto">
          {/* Header Tetap (Sticky Header) */}
          <header className="sticky top-0 z-30 flex justify-between items-center px-4 md:px-8 py-6 bg-background/80 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3 md:hidden">
              <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
              <span className="text-[18px] font-bold text-white">Soundwave</span>
            </div>
            <h2 className="hidden md:block text-[24px] font-bold tracking-tight text-white">Selamat Malam</h2>
            <div className="flex items-center gap-3 ml-auto md:ml-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#252525] flex items-center justify-center">
                <img alt="Profil Pengguna" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF8rrz4oS26EkUUchSlTVtsCR0sKAR9yBXsMyMINrzcqLFYSMhXxz9p-ZQVLVfaAEkxfABauLPs5rzd7YlLbJvLGcb5RCjPD6_MCVIIrWa_BFtaSsGKb2bRHI1AopmCYhsZoDYoKIxHRcCJafEsUybfve2U6H4m7DKUylBD231-O35d-FGE3eMD6TfXirxuBvNoSZc4FbSanCBqj1WhIkYsbbfVrdJJ0ppGTSjt8Ssz96ny9j-zvcZ7iTn_WlGjDC3iNLrEQFJRsM" />
              </div>
            </div>
          </header>

          {/* Konten Utama Beranda */}
          <div className="pt-6 px-4 md:px-8 flex flex-col gap-8 pb-24">
            <h2 className="md:hidden text-[24px] font-bold tracking-tight text-white mb-[-16px]">Selamat Malam</h2>
            
            {/* Bagian: kategori musik dari Deezer */}
            <section>
              {isGenresLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-14 animate-pulse rounded-md bg-[#292a2a] md:h-20"
                    />
                  ))}
                </div>
              ) : genresError ? (
                <p className="text-sm text-[#b3b3b3]">{genresError}</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {genres.slice(0, 6).map((genre, index) => (
                    <GenreCard
                      key={genre.id}
                      genre={genre}
                      variant="wide"
                      href={`/discover?genreId=${genre.id}&genreName=${encodeURIComponent(genre.name)}`}
                      className={index > 3 ? 'hidden md:flex' : undefined}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Bagian: Dibuat untuk Kamu */}
            <section className="mt-4">
              <div className="flex items-end justify-between mb-4">
                <h3 className="text-[24px] font-bold tracking-tight text-white hover:underline cursor-pointer">Dibuat untuk Kamu</h3>
                <a className="text-[12px] font-bold text-[#b3b3b3] hover:text-white uppercase tracking-wider" href="#">Tampilkan semua</a>
              </div>
              {/* Scroll horizontal pada mobile, grid pada desktop */}
              <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-x-auto pb-3 snap-x no-scrollbar">
                {/* Kartu 1 */}
                <div className="group bg-[#1e2020] hover:bg-[#252525] p-4 rounded-lg flex-shrink-0 w-[160px] md:w-auto transition-colors duration-300 cursor-pointer snap-start shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <div className="relative mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden aspect-square">
                    <img className="w-full h-full object-cover" alt="Discover Weekly" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBqmFfZjEUwljApGREyjtc5a7lohXeJ9NLjl5AjBPCuq29-vK8N3G2Gtm0ybRQuo2nqNXBSN-cEoA1efGFJiXfRTc0OCkuvwBIssdZntLOMnYCILlVT9cOxxLYEEswQca1Q6BydLyZSTHs_HcBtYaB_kuUjWBAT0DhWlj7nZxMZWX4mievHC8NWqtDLsqzctZtDCujBRUEs-mvZB8seYSRR5AumRPnxuottpHE6oFdSLx3sAG5Sks3LqlGdS6yMvQuZNQqqRLEnpA" />
                    <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1ed760] text-[#005721] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-4 group-hover:translate-y-0 z-10 hover:scale-105 hover:bg-[#34e36a]">
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-[16px] text-white mb-1 truncate">Discover Weekly</h4>
                  <p className="text-[14px] text-[#b3b3b3] line-clamp-2">Lagu baru dan lagu lama untuk kamu. Diperbarui setiap Senin.</p>
                </div>
                {/* Kartu 2 */}
                <div className="group bg-[#1e2020] hover:bg-[#252525] p-4 rounded-lg flex-shrink-0 w-[160px] md:w-auto transition-colors duration-300 cursor-pointer snap-start shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <div className="relative mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden aspect-square">
                    <img className="w-full h-full object-cover" alt="Daily Mix 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxWMwo9sB0OPgvUyAps3vbEJuVfoK_MdBNxpCp5BYkIUE2GZfSOVsgJbJMdm8qoTQTKU_mnWkY8nQ2GeebMk7fcYf_fU5WotxBtTwKK2DVT4axtEDO_cAJFHd-A2BZreaLHL7APr3oDTHHdgrZfcoei1cqw5nLd3MlVH1kqwrZFF4ScpgqkJsgDWIYzPzO5C1wV-zgS3-W_Jbd25kbCr-2nMZK2m94gvIbcSOaHho61fLcmzReDKtJ-eWV7Rha5x6uX8P291h9xS8" />
                    <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1ed760] text-[#005721] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-4 group-hover:translate-y-0 z-10 hover:scale-105 hover:bg-[#34e36a]">
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-[16px] text-white mb-1 truncate">Daily Mix 1</h4>
                  <p className="text-[14px] text-[#b3b3b3] line-clamp-2">Tulus, Raisa, Afgan, dan lainnya.</p>
                </div>
                {/* Kartu 3 */}
                <div className="group bg-[#1e2020] hover:bg-[#252525] p-4 rounded-lg flex-shrink-0 w-[160px] md:w-auto transition-colors duration-300 cursor-pointer snap-start shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <div className="relative mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden aspect-square">
                    <img className="w-full h-full object-cover" alt="Release Radar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBj8owI0sJL5a2COUB1XwlcOAHii7KmpVNuE6cXvrRMr2dGeWekJebY4cqgeDU3py9bQ9YRPPhqO_MzSY-QMaA9olpPX0JrFE0-gtl32rfYSHKWz76hPXe6wuWKjmOY-ydx4H8gDZwtPMCikmEGAIIgN43F3wuQrF9K6MDtj-f7kKmK_Mf2UjKwA9kg9iUIyjdqFSCCixRdF--SV5PpqEz7Zndjy-lHTfOH6eQjJjYYIMk2Dv40vfMNZYS_lROIrFD7PxemD-3mDC4" />
                    <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1ed760] text-[#005721] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-4 group-hover:translate-y-0 z-10 hover:scale-105 hover:bg-[#34e36a]">
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-[16px] text-white mb-1 truncate">Release Radar</h4>
                  <p className="text-[14px] text-[#b3b3b3] line-clamp-2">Dengarkan rilis terbaru dari artis yang kamu ikuti.</p>
                </div>
                {/* Kartu 4 */}
                <div className="group bg-[#1e2020] hover:bg-[#252525] p-4 rounded-lg flex-shrink-0 w-[160px] md:w-auto transition-colors duration-300 cursor-pointer snap-start shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <div className="relative mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden aspect-square">
                    <img className="w-full h-full object-cover" alt="Daily Mix 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZpDGIITC8iIhh2XG-cdeX5GewyQEH2GYjQMbi8bpc2QDaM9GDrRqonjvTVz-jA7OegKjS8havpBlMROc6_uvNGoViW3dwG76ZWenzlnC7W5ALW7XXZxLWEdzDEqg9lX8zmfcqZBUAeo63J3iI6QANzkvy3nbl7fTwqN42DhutfkhwYAEHDk-Pr2T7VgxKvjw8GVyAnJRPdfnat_ueWyE2UaukheqzE2RQ1KwcemPfrD18n511Z2Vud-OFO9dNd_eqln8aQUXrZBU" />
                    <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1ed760] text-[#005721] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-4 group-hover:translate-y-0 z-10 hover:scale-105 hover:bg-[#34e36a]">
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-[16px] text-white mb-1 truncate">Daily Mix 2</h4>
                  <p className="text-[14px] text-[#b3b3b3] line-clamp-2">Hindia, Pamungkas, Nadin Amizah.</p>
                </div>
              </div>
            </section>

            {/* Bagian: Trending Musik Indonesia */}
            <section className="mt-4 mb-8">
              <div className="flex items-end justify-between mb-4">
                <h3 className="text-[24px] font-bold tracking-tight text-white hover:underline cursor-pointer">Trending Musik</h3>
                <a className="text-[12px] font-bold text-[#b3b3b3] hover:text-white uppercase tracking-wider" href="#">Tampilkan semua</a>
              </div>
              
              {isTrendingLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : trendingSongs && trendingSongs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {trendingSongs.map((song, index) => (
                    <MusicCard
                      key={song.musicId}
                      song={song}
                      playQueue={trendingSongs}
                      queueIndex={index}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[#b3b3b3]">Belum ada data trending saat ini.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
