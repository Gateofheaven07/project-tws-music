'use client';

import { useCallback, useState } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';

// ─── Types ───────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalPlaylists: number;
  totalLikedSongs: number;
  totalPlays: number;
  totalReviews: number;
  averageRating: number;
}

export interface ChartData {
  registrations: { date: string; count: number }[];
  topSongs: { title: string; artist: string; count: number }[];
  authProviders: { provider: string; count: number }[];
  dailyPlays: { date: string; count: number }[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  authProvider: string;
  createdAt: string;
  _count: {
    playlists: number;
    likedSongs: number;
    playHistory: number;
  };
}

export interface AdminUserDetail extends AdminUser {
  updatedAt: string;
  appReview: {
    id: string;
    rating: number;
    review: string;
    createdAt: string;
  } | null;
}

export interface AdminReview {
  id: string;
  rating: number;
  review: string;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SystemHealth {
  overall: string;
  database: { status: string; latencyMs: number };
  environment: {
    status: string;
    variables: Record<string, boolean>;
    missing: string[];
  };
  runtime: {
    nodeVersion: string;
    platform: string;
    uptime: number;
    memoryUsage: { heapUsed: number; heapTotal: number; rss: number };
    isVercel: boolean;
    vercelRegion: string | null;
  };
}

// ─── Hook ────────────────────────────────────────────

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Dashboard ─────────────────────────────────────

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Gagal memuat dashboard stats.'));
    }
  }, []);

  const fetchDashboardCharts = useCallback(async () => {
    try {
      const res = await api.get('/admin/dashboard/charts');
      return res.data.data as ChartData;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Gagal memuat chart data.'));
    }
  }, []);

  // ─── Users ─────────────────────────────────────────

  const fetchUsers = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    provider?: string;
  }) => {
    try {
      const res = await api.get('/admin/users', { params });
      return {
        users: res.data.results as AdminUser[],
        meta: res.data.meta as PaginationMeta,
      };
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Gagal memuat daftar user.'));
    }
  }, []);

  const fetchUserDetail = useCallback(async (id: string) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      return res.data.data as AdminUserDetail;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Gagal memuat detail user.'));
    }
  }, []);

  const updateUserRole = useCallback(async (id: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/admin/users/${id}/role`, { role });
      return res.data;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Gagal mengubah role user.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: { email: string; username: string; password?: string; role: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/admin/users', data);
      return res.data;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Gagal membuat user baru.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: { email?: string; username?: string; password?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/admin/users/${id}`, data);
      return res.data;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Gagal mengubah data user.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Gagal menghapus user.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Reviews ───────────────────────────────────────

  const fetchReviews = useCallback(async (params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sort?: string;
  }) => {
    try {
      const res = await api.get('/admin/reviews', { params });
      return {
        reviews: res.data.results as AdminReview[],
        meta: res.data.meta as PaginationMeta,
      };
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Gagal memuat daftar ulasan.'));
    }
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/admin/reviews/${id}`);
      return res.data;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Gagal menghapus ulasan.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const replyToReview = useCallback(async (id: string, reply: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/admin/reviews/${id}/reply`, { reply });
      return res.data;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Gagal membalas ulasan.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Analytics ─────────────────────────────────────

  const fetchAnalytics = useCallback(async () => {
    try {
      const [regs, songs, artists, genres] = await Promise.all([
        api.get('/admin/analytics/registrations'),
        api.get('/admin/analytics/top-songs'),
        api.get('/admin/analytics/top-artists'),
        api.get('/admin/analytics/genres'),
      ]);
      return {
        registrations: regs.data.data,
        topSongs: songs.data.data,
        topArtists: artists.data.data,
        genres: genres.data.data,
      };
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Gagal memuat data analytics.'));
    }
  }, []);

  // ─── System ────────────────────────────────────────

  const fetchSystemHealth = useCallback(async () => {
    try {
      const res = await api.get('/admin/system/health');
      return res.data.data as SystemHealth;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Gagal menjalankan health check.'));
    }
  }, []);

  return {
    loading,
    error,
    fetchDashboardStats,
    fetchDashboardCharts,
    fetchUsers,
    fetchUserDetail,
    updateUserRole,
    createUser,
    updateUser,
    deleteUser,
    fetchReviews,
    deleteReview,
    replyToReview,
    fetchAnalytics,
    fetchSystemHealth,
  };
};
