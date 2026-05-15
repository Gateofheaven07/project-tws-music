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
