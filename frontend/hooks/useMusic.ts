'use client';

import { useCallback } from 'react';
import { useMusicStore } from '@/store/musicStore';
import type { Genre } from '@/store/musicStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import type { Song } from '@/store/playerStore';

/**
 * Hook buat urusan musik: nyari lagu, lagu ngetren, favorit, dsb.
 */
export const useMusic = () => {
  const {
    searchResults,
    searchQuery,
    isSearching,
    trendingSongs,
    isTrendingLoading,
    genres,
    isGenresLoading,
    genresError,
    favoriteSongs,
    isFavoritesLoading,
    recentSongs,
    setSearchResults,
    setSearchQuery,
    setSearching,
    setTrendingSongs,
    setTrendingLoading,
    setGenres,
    setGenresLoading,
    setGenresError,
    setFavoriteSongs,
    setFavoritesLoading,
    toggleFavorite,
    addToRecent,
    clearSearch,
  } = useMusicStore();

  const { accessToken } = useAuthStore();

  const searchMusic = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        clearSearch();
        return;
      }

      setSearchQuery(query);
      setSearching(true);

      try {
        const response = await api.get('/music/search', {
          params: { q: query },
        });
        // Pake results sesuai arsitektur baru
        setSearchResults(response.data.results || []);
      } catch (error) {
        console.error('Gagal nyari musik:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [setSearchQuery, setSearching, setSearchResults, clearSearch]
  );

  const getTrendingSongs = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const response = await api.get('/music/trending');
      setTrendingSongs(response.data.results || []);
    } catch (error) {
      console.error('Gagal ngambil lagu trending:', error);
      setTrendingSongs([]);
    } finally {
      setTrendingLoading(false);
    }
  }, [setTrendingSongs, setTrendingLoading]);

  const getGenres = useCallback(async () => {
    setGenresLoading(true);
    setGenresError(null);

    try {
      const response = await api.get('/music/genres');
      setGenres(response.data.results || []);
    } catch (error) {
      console.error('Gagal ngambil kategori musik:', error);
      setGenres([]);
      setGenresError('Kategori musik belum bisa dimuat.');
    } finally {
      setGenresLoading(false);
    }
  }, [setGenres, setGenresLoading, setGenresError]);

  const getSongsByGenre = useCallback(
    async (genre: Pick<Genre, 'id' | 'name'>) => {
      setSearchQuery(genre.name);
      setSearching(true);

      try {
        const response = await api.get(`/music/genres/${genre.id}/songs`, {
          params: { name: genre.name },
        });
        setSearchResults(response.data.results || []);
      } catch (error) {
        console.error('Gagal ngambil lagu berdasarkan genre:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [setSearchQuery, setSearching, setSearchResults]
  );

  const getFavorites = useCallback(async () => {
    if (!accessToken) return;
    setFavoritesLoading(true);
    try {
      const response = await api.get('/liked-songs');
      setFavoriteSongs(response.data.results || []);
    } catch (error) {
      console.error('Gagal ngambil favorit:', error);
    } finally {
      setFavoritesLoading(false);
    }
  }, [accessToken, setFavoriteSongs, setFavoritesLoading]);

  const addFavorite = useCallback(
    async (song: Song) => {
      if (!accessToken) return;
      try {
        await api.post('/liked-songs', {
          musicId: song.musicId,
          title: song.title,
          artist: song.artist?.name || 'Unknown',
          cover: song.album?.cover?.medium || '',
          duration: song.duration || 0,
          videoId: song.playback?.videoId || null
        });
        toggleFavorite(song);
      } catch (error) {
        console.error('Gagal nambah favorit:', error);
      }
    },
    [accessToken, toggleFavorite]
  );

  const removeFavorite = useCallback(
    async (musicId: string) => {
      if (!accessToken) return;
      try {
        await api.delete(`/liked-songs/${musicId}`);
        const song = favoriteSongs.find((s) => s.musicId === musicId);
        if (song) toggleFavorite(song);
      } catch (error) {
        console.error('Gagal hapus favorit:', error);
      }
    },
    [accessToken, favoriteSongs, toggleFavorite]
  );

  return {
    // Pencarian
    searchResults,
    searchQuery,
    isSearching,
    searchMusic,
    setSearchQuery,
    clearSearch,

    // Lagu trending
    trendingSongs,
    isTrendingLoading,
    getTrendingSongs,

    // Kategori musik
    genres,
    isGenresLoading,
    genresError,
    getGenres,
    getSongsByGenre,

    // Lagu favorit
    favoriteSongs,
    isFavoritesLoading,
    getFavorites,
    addFavorite,
    removeFavorite,

    // Riwayat lagu terbaru
    recentSongs,
    addToRecent,
  };
};
