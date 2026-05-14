import { create } from 'zustand';
import type { Song } from './playerStore';

interface MusicStore {
  // Search
  searchResults: Song[];
  searchQuery: string;
  isSearching: boolean;

  // Trending
  trendingSongs: Song[];
  isTrendingLoading: boolean;

  // Favorites
  favoriteSongs: Song[];
  isFavoritesLoading: boolean;

  // Recent
  recentSongs: Song[];

  // Actions
  setSearchResults: (songs: Song[]) => void;
  setSearchQuery: (query: string) => void;
  setSearching: (loading: boolean) => void;
  setTrendingSongs: (songs: Song[]) => void;
  setTrendingLoading: (loading: boolean) => void;
  setFavoriteSongs: (songs: Song[]) => void;
  setFavoritesLoading: (loading: boolean) => void;
  toggleFavorite: (song: Song) => void;
  addToRecent: (song: Song) => void;
  clearSearch: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  searchResults: [],
  searchQuery: '',
  isSearching: false,
  trendingSongs: [],
  isTrendingLoading: false,
  favoriteSongs: [],
  isFavoritesLoading: false,
  recentSongs: [],

  setSearchResults: (songs) => set({ searchResults: songs }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearching: (loading) => set({ isSearching: loading }),
  setTrendingSongs: (songs) => set({ trendingSongs: songs }),
  setTrendingLoading: (loading) => set({ isTrendingLoading: loading }),
  setFavoriteSongs: (songs) => set({ favoriteSongs: songs }),
  setFavoritesLoading: (loading) => set({ isFavoritesLoading: loading }),

  toggleFavorite: (song) => {
    set((state) => {
      const isFavorited = state.favoriteSongs.some((s) => s.id === song.id);
      return {
        favoriteSongs: isFavorited
          ? state.favoriteSongs.filter((s) => s.id !== song.id)
          : [...state.favoriteSongs, song],
      };
    });
  },

  addToRecent: (song) => {
    set((state) => {
      const filtered = state.recentSongs.filter((s) => s.id !== song.id);
      return {
        recentSongs: [song, ...filtered].slice(0, 20),
      };
    });
  },

  clearSearch: () => set({ searchResults: [], searchQuery: '' }),
}));
