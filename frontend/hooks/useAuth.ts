'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api, { getApiErrorMessage } from '@/lib/api';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    setUser,
    setTokens,
    setLoading,
    setError,
    logout: logoutStore,
    clear,
  } = useAuthStore();

  const register = useCallback(
    async (data: RegisterData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/auth/register', data);
        const { user: userData } = response.data.data;
        
        // Kita nggak manggil setUser sama setTokens di sini biar user nggak otomatis login.
        // Alurnya jadi: Daftar -> Ke halaman Login -> Login manual.
        
        return { success: true, user: userData };
      } catch (err) {
        const message = (err as any).response?.data?.message || 'Registration failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const login = useCallback(
    async (data: LoginData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/auth/login', data);
        const { user: userData, tokens } = response.data.data;
        setUser(userData);
        setTokens(tokens.accessToken, tokens.refreshToken);
        return { success: true, user: userData };
      } catch (err) {
        const message = (err as any).response?.data?.message || 'Login failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser, setTokens]
  );

  const logout = useCallback(() => {
    logoutStore();
    clear();
  }, [logoutStore, clear]);

  const getCurrentUser = useCallback(async () => {
    if (!accessToken) return null;
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (err) {
      console.warn(getApiErrorMessage(err, 'Data user belum bisa dimuat.'));
      return null;
    }
  }, [accessToken]);

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    register,
    login,
    logout,
    getCurrentUser,
  };
};
