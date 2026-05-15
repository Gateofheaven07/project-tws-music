import { create } from 'zustand';
import type { Song } from './playerStore';

export interface Genre {
  id: number;
  name: string;
  picture: string;
  pictureSmall: string;
  pictureMedium: string;
  pictureBig: string;
  pictureXl: string;
}

interface MusicStore {
  // Pencarian
  searchResults: Song[];
  searchQuery: string;
  isSearching: boolean;

  // Lagu trending
  trendingSongs: Song[];
  isTrendingLoading: boolean;

  // Kategori musik
  genres: Genre[];
  isGenresLoading: boolean;
  genresError: string | null;

  // Lagu favorit
  favoriteSongs: Song[];
  isFavoritesLoading: boolean;

  // Riwayat lagu terbaru
  recentSongs: Song[];

  // Aksi store
  setSearchResults: (songs: Song[]) => void;
  setSearchQuery: (query: string) => void;
  setSearching: (loading: boolean) => void;
  setTrendingSongs: (songs: Song[]) => void;
  setTrendingLoading: (loading: boolean) => void;
  setGenres: (genres: Genre[]) => void;
  setGenresLoading: (loading: boolean) => void;
  setGenresError: (message: string | null) => void;
  setFavoriteSongs: (songs: Song[]) => void;
  setFavoritesLoading: (loading: boolean) => void;
  toggleFavorite: (song: Song) => void;
  addToRecent: (song: Song) => void;
  clearSearch: () => void;
}

export const useMusicStore = create<MusicStore>((set) => ({
  searchResults: [],
  searchQuery: '',
  isSearching: false,
  trendingSongs: [],
  isTrendingLoading: false,
  genres: [],
  isGenresLoading: false,
  genresError: null,
  favoriteSongs: [],
  isFavoritesLoading: false,
  recentSongs: [],

  setSearchResults: (songs) => set({ searchResults: songs }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearching: (loading) => set({ isSearching: loading }),
  setTrendingSongs: (songs) => set({ trendingSongs: songs }),
  setTrendingLoading: (loading) => set({ isTrendingLoading: loading }),
  setGenres: (genres) => set({ genres }),
  setGenresLoading: (loading) => set({ isGenresLoading: loading }),
  setGenresError: (message) => set({ genresError: message }),
  setFavoriteSongs: (songs) => set({ favoriteSongs: songs }),
  setFavoritesLoading: (loading) => set({ isFavoritesLoading: loading }),

  toggleFavorite: (song) => {
    set((state) => {
      const isFavorited = state.favoriteSongs.some((s) => s.musicId === song.musicId);
      return {
        favoriteSongs: isFavorited
          ? state.favoriteSongs.filter((s) => s.musicId !== song.musicId)
          : [...state.favoriteSongs, song],
      };
    });
  },

  addToRecent: (song) => {
    set((state) => {
      const filtered = state.recentSongs.filter((s) => s.musicId !== song.musicId);
      return {
        recentSongs: [song, ...filtered].slice(0, 20),
      };
    });
  },

  clearSearch: () => set({ searchResults: [], searchQuery: '' }),
}));
