'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Music, Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, error, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    const result = await login({ email, password });
    if (!result.success) {
      setFormError(result.error || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Left Side - Branding */}
      <div className="hidden w-1/2 flex-col items-center justify-center gap-8 p-12 lg:flex">
        <div className="flex items-center gap-3 text-4xl font-bold text-primary">
          <Music className="h-12 w-12" />
          <span>SoundWave</span>
        </div>
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Discover Your Sound</h2>
          <p className="text-lg text-muted-foreground">
            Stream your favorite music, create playlists, and share with friends.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-primary lg:hidden">
              <Music className="h-6 w-6" />
              <span>SoundWave</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {(formError || error) && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {formError || error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 mt-6"
            >
              {isLoading && <Loader className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
