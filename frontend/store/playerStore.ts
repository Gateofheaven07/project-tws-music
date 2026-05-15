import { create } from 'zustand';

export interface Song {
  musicId: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  album: {
    id: string;
    name: string;
    cover: {
      small: string;
      medium: string;
      big: string;
      xl: string;
    };
  };
  duration: number;
  genres: string[];
  releaseDate: string;
  playback: {
    provider: string;
    type: string;
    status?: 'ready' | 'unavailable';
    videoId: string | null;
    embedUrl: string | null;
    youtubeUrl: string | null;
    errorReason?: string | null;
  };
  statistics: {
    popularity: number;
  };
}

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerStore {
  // Antrian dan lagu aktif
  queue: Song[];
  currentSongIndex: number;
  currentSong: Song | null;

  // Status pemutaran
  isPlaying: boolean;
  currentTime: number;
  duration: number;

  // Preferensi player
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;

  // Status tampilan player
  showNowPlaying: boolean;

  // Aksi player
  startPlayback: (songs: Song[], index?: number) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentSongIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  next: () => void;
  previous: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setShowNowPlaying: (show: boolean) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  queue: [],
  currentSongIndex: 0,
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isMuted: false,
  repeatMode: 'off',
  isShuffle: false,
  showNowPlaying: false,

  startPlayback: (songs, index = 0) => {
    const safeIndex = Math.min(Math.max(index, 0), Math.max(songs.length - 1, 0));

    set({
      queue: songs,
      currentSongIndex: safeIndex,
      currentSong: songs[safeIndex] || null,
      isPlaying: songs.length > 0,
      currentTime: 0,
      duration: 0,
      showNowPlaying: songs.length > 0,
    });
  },

  setQueue: (songs) => {
    set({ queue: songs, currentSongIndex: 0, currentSong: songs[0] || null });
  },

  addToQueue: (song) => {
    set((state) => ({
      queue: [...state.queue, song],
    }));
  },

  removeFromQueue: (index) => {
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
    }));
  },

  clearQueue: () => {
    set({ queue: [], currentSongIndex: 0, currentSong: null, isPlaying: false });
  },

  setCurrentSongIndex: (index) => {
    set((state) => ({
      currentSongIndex: index,
      currentSong: state.queue[index] || null,
      currentTime: 0,
    }));
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ queue: [], currentSongIndex: 0, currentSong: null, isPlaying: false, currentTime: 0, duration: 0, showNowPlaying: false }),

  togglePlayPause: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  next: () => {
    set((state) => {
      let nextIndex = state.currentSongIndex + 1;
      if (nextIndex >= state.queue.length) {
        nextIndex = state.repeatMode === 'all' ? 0 : state.currentSongIndex;
      }
      return {
        currentSongIndex: nextIndex,
        currentSong: state.queue[nextIndex] || null,
        currentTime: 0,
      };
    });
  },

  previous: () => {
    set((state) => {
      let prevIndex = state.currentSongIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.currentSongIndex;
      }
      return {
        currentSongIndex: prevIndex,
        currentSong: state.queue[prevIndex] || null,
        currentTime: 0,
      };
    });
  },

  setRepeatMode: (mode) => set({ repeatMode: mode }),
  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },
  setShowNowPlaying: (show) => set({ showNowPlaying: show }),
}));
