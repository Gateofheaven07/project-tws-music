'use client';

import { useState, useCallback } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

// Tipe data untuk riwayat putar yang dikembalikan dari backend
export interface HistoryItem {
  id: string;
  musicId: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  videoId: string | null;
  playedAt: string;
}

// Tipe data profil user yang ditampilkan di halaman profil
export interface ProfileData {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

export const useProfile = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const currentUser = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ambil data profil user dari server.
   */
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/profile/me');
      const data: ProfileData = res.data.data;
      setProfile(data);
      return data;
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Gagal memuat profil.');
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update username user dan perbarui state global (authStore).
   */
  const updateUsername = useCallback(async (username: string) => {
    setIsUpdating(true);
    try {
      const res = await api.patch('/profile/username', { username });
      const updatedData = res.data.data;

      // Perbarui data profil lokal
      setProfile((prev) => prev ? { ...prev, username: updatedData.username } : prev);

      // Perbarui state global biar username di sidebar ikut berubah
      if (currentUser) {
        setUser({ ...currentUser, username: updatedData.username });
      }

      return { success: true };
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Gagal update username.');
      return { success: false, error: msg };
    } finally {
      setIsUpdating(false);
    }
  }, [currentUser, setUser]);

  /**
   * Update password user. Butuh password lama yang benar.
   */
  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsUpdating(true);
    try {
      await api.patch('/profile/password', { currentPassword, newPassword });
      return { success: true };
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Gagal update password.');
      return { success: false, error: msg };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Upload foto profil baru.
   * Kirim file sebagai multipart/form-data dan perbarui URL avatar di state global.
   */
  const uploadAvatar = useCallback(async (file: File) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.patch('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedData = res.data.data;
      const newAvatar: string = updatedData.avatar;

      // Perbarui data profil lokal
      setProfile((prev) => prev ? { ...prev, avatar: newAvatar } : prev);

      // Perbarui state global biar avatar di sidebar ikut berubah tanpa perlu refresh
      if (currentUser) {
        setUser({ ...currentUser, avatar: newAvatar });
      }

      return { success: true, avatar: newAvatar };
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Gagal upload avatar.');
      return { success: false, error: msg };
    } finally {
      setIsUpdating(false);
    }
  }, [currentUser, setUser]);

  /**
   * Ambil riwayat lagu yang pernah diputar user.
   */
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/profile/history');
      // Data dari backend bisa ada di results (array) atau data
      const data: HistoryItem[] = res.data.results ?? res.data.data ?? [];
      setHistory(data);
      return data;
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Gagal memuat riwayat.');
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    profile,
    history,
    isLoading,
    isUpdating,
    error,
    fetchProfile,
    updateUsername,
    updatePassword,
    uploadAvatar,
    fetchHistory,
  };
};
