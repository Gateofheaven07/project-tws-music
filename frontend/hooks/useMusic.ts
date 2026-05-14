'use client';

import { useCallback } from 'react';
import { useMusicStore } from '@/store/musicStore';
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
    favoriteSongs,
    isFavoritesLoading,
    recentSongs,
    setSearchResults,
    setSearchQuery,
    setSearching,
    setTrendingSongs,
    setTrendingLoading,
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
        // Pake api instance biar token otomatis kejual kalo udah login
        const response = await api.get('/music/search', {
          params: { q: query },
        });
        setSearchResults(response.data.data);
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
      setTrendingSongs(response.data.data);
    } catch (error) {
      console.error('Gagal ngambil lagu trending:', error);
      setTrendingSongs([]);
    } finally {
      setTrendingLoading(false);
    }
  }, [setTrendingSongs, setTrendingLoading]);

  const getFavorites = useCallback(async () => {
    if (!accessToken) return;
    setFavoritesLoading(true);
    try {
      const response = await api.get('/favorites');
      setFavoriteSongs(response.data.data);
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
        await api.post('/favorites', {
          songId: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          thumbnail: song.thumbnail,
          duration: song.duration
        });
        toggleFavorite(song);
      } catch (error) {
        console.error('Gagal nambah favorit:', error);
      }
    },
    [accessToken, toggleFavorite]
  );

  const removeFavorite = useCallback(
    async (songId: string) => {
      if (!accessToken) return;
      try {
        await api.delete(`/favorites/${songId}`);
        const song = favoriteSongs.find((s) => s.id === songId);
        if (song) toggleFavorite(song);
      } catch (error) {
        console.error('Gagal hapus favorit:', error);
      }
    },
    [accessToken, favoriteSongs, toggleFavorite]
  );

  return {
    // Search
    searchResults,
    searchQuery,
    isSearching,
    searchMusic,
    setSearchQuery,
    clearSearch,

    // Trending
    trendingSongs,
    isTrendingLoading,
    getTrendingSongs,

    // Favorites
    favoriteSongs,
    isFavoritesLoading,
    getFavorites,
    addFavorite,
    removeFavorite,

    // Recent
    recentSongs,
    addToRecent,
  };
};
