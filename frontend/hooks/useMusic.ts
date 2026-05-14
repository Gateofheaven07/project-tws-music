'use client';

import { useCallback } from 'react';
import { useMusicStore } from '@/store/musicStore';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import type { Song } from '@/store/playerStore';

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
        const response = await axios.get('/api/music/search', {
          params: { q: query },
        });
        setSearchResults(response.data.data);
      } catch (error) {
        console.error('[v0] Search error:', error);
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
      const response = await axios.get('/api/music/trending');
      setTrendingSongs(response.data.data);
    } catch (error) {
      console.error('[v0] Trending songs error:', error);
      setTrendingSongs([]);
    } finally {
      setTrendingLoading(false);
    }
  }, [setTrendingSongs, setTrendingLoading]);

  const getFavorites = useCallback(async () => {
    if (!accessToken) return;
    setFavoritesLoading(true);
    try {
      const response = await axios.get('/api/favorites', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFavoriteSongs(response.data.data);
    } catch (error) {
      console.error('[v0] Get favorites error:', error);
    } finally {
      setFavoritesLoading(false);
    }
  }, [accessToken, setFavoriteSongs, setFavoritesLoading]);

  const addFavorite = useCallback(
    async (song: Song) => {
      if (!accessToken) return;
      try {
        await axios.post(
          '/api/favorites',
          { songId: song.id },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        toggleFavorite(song);
      } catch (error) {
        console.error('[v0] Add favorite error:', error);
      }
    },
    [accessToken, toggleFavorite]
  );

  const removeFavorite = useCallback(
    async (songId: string) => {
      if (!accessToken) return;
      try {
        await axios.delete(`/api/favorites/${songId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const song = favoriteSongs.find((s) => s.id === songId);
        if (song) toggleFavorite(song);
      } catch (error) {
        console.error('[v0] Remove favorite error:', error);
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
