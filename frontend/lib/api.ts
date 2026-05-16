import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * Instance axios yang udah dikonfigurasi.
 * Otomatis nambahin token ke header kalo usernya udah login.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

export const getApiErrorMessage = (error: unknown, fallback = 'Permintaan belum berhasil diproses.') => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Server API belum bisa dihubungi. Pastikan backend berjalan di port 5000.';
    }

    const message = error.response.data?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }

  return fallback;
};

// Interceptor buat nambahin token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor buat nanganin error global (misal token kadaluarsa)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Kalo unauthorized, mungkin tokennya udah basi. 
      // Kita bisa logout atau refresh token di sini.
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
