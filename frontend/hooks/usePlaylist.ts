'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

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
        const response = await axios.post(
          '/api/playlists',
          { name, description },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        return response.data.data;
      } catch (error) {
        console.error('[v0] Create playlist error:', error);
        return null;
      }
    },
    [accessToken]
  );

  const getPlaylists = useCallback(async () => {
    if (!accessToken) return [];
    try {
      const response = await axios.get('/api/playlists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data.data;
    } catch (error) {
      console.error('[v0] Get playlists error:', error);
      return [];
    }
  }, [accessToken]);

  const getPlaylistById = useCallback(
    async (id: string) => {
      if (!accessToken) return null;
      try {
        const response = await axios.get(`/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data.data;
      } catch (error) {
        console.error('[v0] Get playlist error:', error);
        return null;
      }
    },
    [accessToken]
  );

  const updatePlaylist = useCallback(
    async (id: string, name: string, description?: string) => {
      if (!accessToken) return null;
      try {
        const response = await axios.put(
          `/api/playlists/${id}`,
          { name, description },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        return response.data.data;
      } catch (error) {
        console.error('[v0] Update playlist error:', error);
        return null;
      }
    },
    [accessToken]
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      if (!accessToken) return false;
      try {
        await axios.delete(`/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return true;
      } catch (error) {
        console.error('[v0] Delete playlist error:', error);
        return false;
      }
    },
    [accessToken]
  );

  const addSongToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (!accessToken) return null;
      try {
        const response = await axios.post(
          `/api/playlists/${playlistId}/songs`,
          { songId },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        return response.data.data;
      } catch (error) {
        console.error('[v0] Add song to playlist error:', error);
        return null;
      }
    },
    [accessToken]
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (!accessToken) return false;
      try {
        await axios.delete(`/api/playlists/${playlistId}/songs/${songId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return true;
      } catch (error) {
        console.error('[v0] Remove song from playlist error:', error);
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
