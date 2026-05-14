'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

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
        const response = await axios.post('/api/auth/register', data);
        const { user: userData, tokens } = response.data.data;
        setUser(userData);
        setTokens(tokens.accessToken, tokens.refreshToken);
        return { success: true, user: userData };
      } catch (err) {
        const message = (err as any).response?.data?.message || 'Registration failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser, setTokens]
  );

  const login = useCallback(
    async (data: LoginData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post('/api/auth/login', data);
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
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.data;
    } catch (err) {
      console.error('[v0] Get current user error:', err);
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
