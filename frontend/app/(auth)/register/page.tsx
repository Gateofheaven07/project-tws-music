'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Music, Loader } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { isLoading, error, register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Fungsi buat nangani proses submit pas daftar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !username || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    const result = await register({ email, username, password });

    if (!result.success) {
      setFormError(result.error || 'Registration failed');
      return;
    }

    router.push('/login');
  };

  // Fungsi pura-pura buat handle pendaftaran lewat Google
  const handleGoogleRegister = () => {
    alert('Fitur daftar dengan akun Google akan segera hadir!');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      
      {/* Background yang sama persis kayak di Landing Page */}
      <div className="absolute inset-0 z-0 bg-background">
        <img 
          alt="Abstract dark sound waves background" 
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE73-H7Zw2GiJW4R7VZZsMVZFqk0R5mtuV44PK__EAu9HfatUgKulhkR3KpJoCfVMMhlgBBr7qUENctX_8KPLo2VXioCEnlUmlsznMT9qPEljKHGZDQdBdeSldN_RYt8Lx-u1w9VrcZVW9Ojha2nqNR_hquyeVXcS_q3MzrtSqKivD5awt_5r0U9q6-fJyiPKjA8Ak8x0QdYRA8HD2X7lkQN87Ic68S4RSlPdcdO8LNs5rDW-QOy7n5lPxQ_PPyys53vgrhYmCCUQ" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
      </div>

      {/* Kontainer form buat pendaftaran */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center p-6 sm:max-w-md">
        
        {/* Judul dan Logo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" className="mb-4 flex items-center justify-center gap-2 text-3xl font-bold text-primary transition-transform hover:scale-105">
            <Music className="h-8 w-8" />
            <span>Soundwave</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Buat Akun</h1>
          <p className="mt-2 text-base text-[#B3B3B3]">Daftar gratis untuk mulai mendengarkan</p>
        </div>

        {/* Card Formulir Pendaftaran */}
        <div className="w-full rounded-[2rem] bg-[#1e2020]/90 backdrop-blur-md p-8 shadow-2xl border border-white/5">
          
          {/* Tombol Daftar pakai Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full mb-6 flex items-center justify-center gap-3 rounded-full border border-border bg-transparent px-4 py-3 font-bold text-foreground transition-all hover:bg-white/5 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Daftar dengan Google
          </button>

          <div className="relative mb-6 flex items-center justify-center">
            <span className="w-full border-t border-border/50"></span>
            <span className="absolute bg-[#1e2020] px-3 text-xs uppercase text-[#B3B3B3]">Atau</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inputan Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-[#B3B3B3] transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Email Address"
              />
            </div>

            {/* Inputan Username */}
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-bold text-foreground">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-[#B3B3B3] transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Username"
              />
            </div>

            {/* Inputan Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-[#B3B3B3] transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Password"
              />
            </div>

            {/* Inputan Konfirmasi Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-foreground">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder-[#B3B3B3] transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Confirm Password"
              />
            </div>

            {/* Area error kalo gagal validasi */}
            {(formError || error) && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 text-center">
                {formError || error}
              </div>
            )}

            {/* Tombol Buat Daftar */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-bold tracking-[1.8px] text-primary-foreground transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <Loader className="h-5 w-5 animate-spin" />}
              {isLoading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
            </button>
          </form>

          {/* Link buat masuk kalo udah punya akun */}
          <p className="mt-8 text-center text-sm text-[#B3B3B3]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-foreground underline hover:text-primary transition-colors">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}