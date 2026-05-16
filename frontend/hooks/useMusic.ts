'use client';

import { useCallback } from 'react';
import { useMusicStore } from '@/store/musicStore';
import type { Genre } from '@/store/musicStore';
import { useAuthStore } from '@/store/authStore';
import api, { getApiErrorMessage } from '@/lib/api';
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
    recommendedSongs,
    recommendationMeta,
    isRecommendationsLoading,
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
    setRecommendedSongs,
    setRecommendationMeta,
    setRecommendationsLoading,
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
        console.warn(getApiErrorMessage(error, 'Musik belum bisa dicari saat ini.'));
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
      console.warn(getApiErrorMessage(error, 'Lagu trending belum bisa dimuat.'));
      setTrendingSongs([]);
    } finally {
      setTrendingLoading(false);
    }
  }, [setTrendingSongs, setTrendingLoading]);

  const getRecommendations = useCallback(async () => {
    if (!accessToken) return;

    setRecommendationsLoading(true);
    try {
      const response = await api.get('/music/recommendations');
      setRecommendedSongs(response.data.results || []);
      setRecommendationMeta(response.data.meta || null);
    } catch (error) {
      console.warn(getApiErrorMessage(error, 'Rekomendasi musik belum bisa dimuat.'));
      setRecommendedSongs([]);
      setRecommendationMeta(null);
    } finally {
      setRecommendationsLoading(false);
    }
  }, [accessToken, setRecommendedSongs, setRecommendationMeta, setRecommendationsLoading]);

  const getGenres = useCallback(async () => {
    setGenresLoading(true);
    setGenresError(null);

    try {
      const response = await api.get('/music/genres');
      setGenres(response.data.results || []);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Kategori musik belum bisa dimuat.');
      console.warn(message);
      setGenres([]);
      setGenresError(message);
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
        console.warn(getApiErrorMessage(error, 'Lagu berdasarkan genre belum bisa dimuat.'));
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
      console.warn(getApiErrorMessage(error, 'Lagu favorit belum bisa dimuat.'));
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
          videoId: song.playback?.videoId || null,
          genre: song.genres?.[0] || null
        });
        toggleFavorite(song);
      } catch (error) {
        console.warn(getApiErrorMessage(error, 'Lagu belum bisa ditambahkan ke favorit.'));
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
        console.warn(getApiErrorMessage(error, 'Lagu belum bisa dihapus dari favorit.'));
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

    // Rekomendasi personal
    recommendedSongs,
    recommendationMeta,
    isRecommendationsLoading,
    getRecommendations,

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
