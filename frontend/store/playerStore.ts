import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnail?: string;
  youtubeUrl?: string;
  deezerUrl?: string;
}

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerStore {
  // Queue & Current Song
  queue: Song[];
  currentSongIndex: number;
  currentSong: Song | null;

  // Playback State
  isPlaying: boolean;
  currentTime: number;
  duration: number;

  // Preferences
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;

  // Actions
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentSongIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  next: () => void;
  previous: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
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
}));
