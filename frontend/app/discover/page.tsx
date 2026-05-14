'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PlayerBar } from '@/components/PlayerBar';
import { MusicCard } from '@/components/MusicCard';
import { useMusic } from '@/hooks/useMusic';
import { Loader } from 'lucide-react';

export default function DiscoverPage() {
  const { searchResults, searchQuery, isSearching, searchMusic, getTrendingSongs, trendingSongs, isTrendingLoading } = useMusic();

  useEffect(() => {
    getTrendingSongs();
  }, [getTrendingSongs]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Cari" />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-8">
              {searchQuery ? (
                // Search Results
                <section>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Results for &quot;{searchQuery}&quot;
                    </h2>
                    <p className="text-muted-foreground">Found {searchResults.length} songs</p>
                  </div>

                  {isSearching ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {searchResults.map((song) => (
                        <MusicCard key={song.musicId} song={song} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                      <p className="text-muted-foreground">No results found for &quot;{searchQuery}&quot;</p>
                      <p className="mt-2 text-sm text-muted-foreground">Try a different search term</p>
                    </div>
                  )}
                </section>
              ) : (
                // Menampilkan Grid Genre (Kategori) sebagai tampilan default
                <section>
                  {/* Judul Bagian */}
                  <h2 className="text-[24px] font-bold tracking-[-0.02em] leading-[1.2] text-foreground mb-6">
                    Jelajahi Semua
                  </h2>
                  
                  {/* Grid Layout untuk Kartu Genre */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    
                    {/* Kartu 1: Pop */}
                    <a className="group relative overflow-hidden rounded-lg aspect-square hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-shadow duration-300 block" href="#">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#E13300] to-[#801D00] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="absolute top-4 left-4 text-[18px] font-bold leading-[1.3] text-white z-10 drop-shadow-md">Pop</h3>
                      <img 
                        alt="Pop Music" 
                        className="absolute -bottom-4 -right-4 w-2/3 h-2/3 object-cover rounded shadow-xl rotate-[25deg] group-hover:rotate-[20deg] group-hover:scale-105 transition-transform duration-300" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuADXGuPDca39hja-Le40Yyp1aGlfXqhadSAOL055gT1Izd9eRR1_kg2BE02JvsZyIvScyfEiofHpylckinZPxb6LDVPhOBXzK57Y2kdFCN2p4GiaYEchA-jzAfnzttL_ct5SpslM8mOtrWXtBHUE6Lfhj4_aT8CprvLjO4OFO2jUaDZr9tzCc1VHGaDCVy71XajWGc6hpBXGQUVNH9KfZMlNWSHsAui_I-iEECuJXmCsX5VJAY62Bv9WSz5YDLoNoNXIn0iiYET-0Q" 
                      />
                    </a>

                    {/* Kartu 2: Rock */}
                    <a className="group relative overflow-hidden rounded-lg aspect-square hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-shadow duration-300 block" href="#">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#E91429] to-[#7A0B15] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="absolute top-4 left-4 text-[18px] font-bold leading-[1.3] text-white z-10 drop-shadow-md">Rock</h3>
                      <img 
                        alt="Rock Music" 
                        className="absolute -bottom-4 -right-4 w-2/3 h-2/3 object-cover rounded shadow-xl rotate-[25deg] group-hover:rotate-[20deg] group-hover:scale-105 transition-transform duration-300" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwpiKBeOguUv1YRSfrvQRzuwF0l6lE6Y1nX26esElb91t_ziT6TpAcoD88glB83lz0ZsaFj7nFSugrgPgfe6yCVcmj7mJWhRPVyJHcDREPH13h2BRUhAYEw_FU9QnT9QKodx5LcFOLoKs7RC3vCkgSFbJGxvlRWPM1i5Eu3LPftdK2qzx6ZowrjotQ5AHTwE5WwCoqApnwV8fVRBFt8d0VhnHVh09caHJNMVC36Ou7F70n03F464feXBMbEwLfa3znpk22nvenURs" 
                      />
                    </a>

                    {/* Kartu 3: Podcast */}
                    <a className="group relative overflow-hidden rounded-lg aspect-square hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-shadow duration-300 block" href="#">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#27856A] to-[#123F32] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="absolute top-4 left-4 text-[18px] font-bold leading-[1.3] text-white z-10 drop-shadow-md">Podcast</h3>
                      <img 
                        alt="Podcast" 
                        className="absolute -bottom-4 -right-4 w-2/3 h-2/3 object-cover rounded shadow-xl rotate-[25deg] group-hover:rotate-[20deg] group-hover:scale-105 transition-transform duration-300" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC9yuGGfrbJvkDiK30x_l_gFwPV8DppGvgipeAzq3jsOG-n2xfwB3O0Df2PVFhqn6LQU2uCLOE875UxX0QzWZ44iuZHLaxgNtth-BJfi71HABbfswvVE5kuEeYSr2axi7eF69vKtiGpsQuSaaeIhnKWbYh42NKOtJLh91_Ii5yM2mJfoVx2ZvdScfhaY9pFZtu5laDbrx7-25HtfpHRdUS2L9jjnHKpQpKeu8GFn4UXBMc_4vYHlIo3TrM3CyamnnCnzq5BPrGSGc" 
                      />
                    </a>

                    {/* Kartu 4: Fokus */}
                    <a className="group relative overflow-hidden rounded-lg aspect-square hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-shadow duration-300 block" href="#">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#503750] to-[#261A26] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="absolute top-4 left-4 text-[18px] font-bold leading-[1.3] text-white z-10 drop-shadow-md">Fokus</h3>
                      <img 
                        alt="Focus" 
                        className="absolute -bottom-4 -right-4 w-2/3 h-2/3 object-cover rounded shadow-xl rotate-[25deg] group-hover:rotate-[20deg] group-hover:scale-105 transition-transform duration-300" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuANuYyS9GntD9QBnidFpxFs3YpuVN2SQ13YVJ5_lqJG22lvy9AmwATKJbo2-kF_wMtpYr3_vKrTCfeH85s00_rSyjVzVeKFJzHueB1CsDE-Zg5Z6OW4x0KT9lXouTc9JK6Cz377krCM0XLWf1gBytM5ZTWYCjqSCszGC1jddkuYRanHBnUNeAxkXPEcZb29H5iZHQZgHbOzHCsibHeW--YALdO2lUhdGTjuqn-ZGYBo7w2POTsFOUIGHxw_lHpo8INCBGS0Asg1VWw" 
                      />
                    </a>

                    {/* Kartu 5: Mood */}
                    <a className="group relative overflow-hidden rounded-lg aspect-square hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-shadow duration-300 block" href="#">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#8C1932] to-[#420C18] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="absolute top-4 left-4 text-[18px] font-bold leading-[1.3] text-white z-10 drop-shadow-md">Mood</h3>
                      <img 
                        alt="Mood" 
                        className="absolute -bottom-4 -right-4 w-2/3 h-2/3 object-cover rounded shadow-xl rotate-[25deg] group-hover:rotate-[20deg] group-hover:scale-105 transition-transform duration-300" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi-YYM7xQ7wgtbNqlVGFE-0bKWD_UaY0eomSf8_zmrsEIRO_zMIzrderJFjsbPufdKFcH5JAMLYKEWKOeDvt62JXIZDmWC27IaEG0kxR8IbWZWKNK1tX16JVzqgSEu-d425svvleIYNU7Uh-teDZwZsAFtSMeQ4S4tUoB6NL6PrR4C8VVEEqRtS8xRzYUCVJgcEynKwDwbkt9f9nK6oDR1GGQYv6GWvTHCJ6UkL6sTaO12R9hRoMjzn8_Y0YDxxwz_jjlWCZenSss" 
                      />
                    </a>

                    {/* Kartu 6: Indie */}
                    <a className="group relative overflow-hidden rounded-lg aspect-square hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-shadow duration-300 block" href="#">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#477D95] to-[#203944] opacity-90 group-hover:opacity-100 transition-opacity"></div>
                      <h3 className="absolute top-4 left-4 text-[18px] font-bold leading-[1.3] text-white z-10 drop-shadow-md">Indie</h3>
                      <img 
                        alt="Indie" 
                        className="absolute -bottom-4 -right-4 w-2/3 h-2/3 object-cover rounded shadow-xl rotate-[25deg] group-hover:rotate-[20deg] group-hover:scale-105 transition-transform duration-300" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb4Uwq6-wzqxMNDYqY_y1lwWTJrN5bsBUHbkDTu1PsJED40WVMUvsZ9ZPoocZROQlXhIzKo3eo5St5AwCvsL5Ip-LMvV5BnOLOCRzHXEgATZH_qmqPZgYQFAereK_TPP5PCgVYHADKKdYATCTTW-tCNuCvnLEBRXn9aU5PX3abja4AzMJyXdEFz1sA2vJXgyLp6Rdb1BoQwB4-EmxPcmn4GEPZll1WmK1Px6sciVPs15y3ULIH5dH8JWIGkN0HhJ4DANm5sVifQxo" 
                      />
                    </a>

                  </div>
                </section>
              )}
          </div>
        </main>
      </div>
    );
  }
