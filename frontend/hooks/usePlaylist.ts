'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api, { getApiErrorMessage } from '@/lib/api';

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  songs?: any[];
}

export const usePlaylist = () => {
  const { accessToken } = useAuthStore();

  const createPlaylist = useCallback(
    async (name: string, description?: string) => {
      if (!accessToken) return null;
      try {
        const response = await api.post('/playlists', { name, description });
        return response.data.data;
      } catch (error) {
        console.warn(getApiErrorMessage(error, 'Playlist belum bisa dibuat.'));
        return null;
      }
    },
    [accessToken]
  );

  const getPlaylists = useCallback(async () => {
    if (!accessToken) return [];
    try {
      const response = await api.get('/playlists');
      return response.data.data;
    } catch (error) {
      console.warn(getApiErrorMessage(error, 'Playlist belum bisa dimuat.'));
      return [];
    }
  }, [accessToken]);

  const getPlaylistById = useCallback(
    async (id: string) => {
      if (!accessToken) return null;
      try {
        const response = await api.get(`/playlists/${id}`);
        return response.data.data;
      } catch (error) {
        console.warn(getApiErrorMessage(error, 'Playlist belum bisa dibuka.'));
        return null;
      }
    },
    [accessToken]
  );

  const updatePlaylist = useCallback(
    async (id: string, name: string, description?: string) => {
      if (!accessToken) return null;
      try {
        const response = await api.put(`/playlists/${id}`, { name, description });
        return response.data.data;
      } catch (error) {
        console.warn(getApiErrorMessage(error, 'Playlist belum bisa diperbarui.'));
        return null;
      }
    },
    [accessToken]
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      if (!accessToken) return false;
      try {
        await api.delete(`/playlists/${id}`);
        return true;
      } catch (error) {
        console.warn(getApiErrorMessage(error, 'Playlist belum bisa dihapus.'));
        return false;
      }
    },
    [accessToken]
  );

  const addSongToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (!accessToken) return null;
      try {
        const response = await api.post(`/playlists/${playlistId}/songs`, { songId });
        return response.data.data;
      } catch (error) {
        console.warn(getApiErrorMessage(error, 'Lagu belum bisa ditambahkan ke playlist.'));
        return null;
      }
    },
    [accessToken]
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (!accessToken) return false;
      try {
        await api.delete(`/playlists/${playlistId}/songs/${songId}`);
        return true;
      } catch (error) {
        console.warn(getApiErrorMessage(error, 'Lagu belum bisa dihapus dari playlist.'));
        return false;
      }
    },
    [accessToken]
  );

  return {
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
  };
};
