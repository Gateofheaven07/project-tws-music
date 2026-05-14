'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PlayerBar } from '@/components/PlayerBar';
import { MusicCard } from '@/components/MusicCard';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/hooks/useMusic';
import { Loader } from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { favoriteSongs, isFavoritesLoading, getFavorites } = useMusic();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    getFavorites();
  }, [user, router, getFavorites]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Your Favorite Songs" />

      <div className="p-8">
        {isFavoritesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="h-8 w-8 animate-spin text-[#1ed760]" />
          </div>
        ) : favoriteSongs.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#ffffff]">Liked Songs</h2>
              <p className="text-[#b3b3b3]">{favoriteSongs.length} songs in your favorites</p>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {favoriteSongs.map((song) => (
                <MusicCard key={song.musicId} song={song} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-[#282828] p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold text-[#ffffff]">No favorite songs yet</h3>
            <p className="mb-6 text-[#b3b3b3]">
              Start adding songs to your favorites by clicking the heart icon.
            </p>
            <Link
              href="/discover"
              className="btn-pill inline-block bg-[#ffffff] text-black px-8 py-3 hover:scale-105 transition-transform"
            >
              Discover Music
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
