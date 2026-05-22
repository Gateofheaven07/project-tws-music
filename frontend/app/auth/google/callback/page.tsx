'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, Music } from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const finishGoogleAuth = async () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');

      if (!accessToken || !refreshToken) {
        setError('Token dari Google tidak ditemukan. Silakan coba daftar lagi.');
        return;
      }

      try {
        setTokens(accessToken, refreshToken);

        const response = await api.get('/auth/me');
        const user = response.data?.data?.user;

        if (!user) {
          setError('Data akun belum bisa dimuat. Silakan coba masuk lagi.');
          return;
        }

        setUser(user);
        window.history.replaceState(null, '', '/auth/google/callback');
        router.replace('/');
      } catch (err) {
        setError(getApiErrorMessage(err, 'Akun Google belum berhasil disiapkan.'));
      }
    };

    finishGoogleAuth();
  }, [router, setTokens, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <Music className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold">Menghubungkan akun Google</h1>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-[#B3B3B3]">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Sedang menyiapkan sesi kamu...</span>
          </div>
        )}
      </div>
    </div>
  );
}
