'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  ListMusic,
  Heart,
  PlayCircle,
  Star,
  TrendingUp,
  UserPlus,
  MessageSquareText,
} from 'lucide-react';
import { useAdmin, type DashboardStats, type ChartData } from '@/hooks/useAdmin';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = ['#1ed760', '#1db954', '#17a74a', '#128a3d', '#0d6d31', '#095a27'];

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentColor = 'text-primary',
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
  accentColor?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#111] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-[#151515]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#666]">{label}</p>
          <p className="mt-2 text-[28px] font-bold tracking-tight text-white">{value}</p>
          {trend && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg bg-white/[0.04] p-2.5', accentColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111] p-5">
      <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-[#888]">{title}</h3>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl">
        <p className="text-[11px] text-[#888]">{label}</p>
        <p className="text-[13px] font-bold text-white">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const { fetchDashboardStats, fetchDashboardCharts } = useAdmin();
  const [stats, setStats] = useState<{ stats: DashboardStats; recentUsers: any[]; recentReviews: any[] } | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, chartsData] = await Promise.all([
          fetchDashboardStats(),
          fetchDashboardCharts(),
        ]);
        setStats(statsData);
        setCharts(chartsData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchDashboardStats, fetchDashboardCharts]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <p className="text-[13px] text-[#666]">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const s = stats?.stats;

  // Format registrations chart data
  const regData = (charts?.registrations || []).map((r) => ({
    date: new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    count: r.count,
  }));

  const playData = (charts?.dailyPlays || []).map((r) => ({
    date: new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    count: r.count,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-[13px] text-[#666]">Ringkasan kondisi platform SoundWave</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={s?.totalUsers ?? 0}
          icon={Users}
          trend={s?.newUsersThisWeek ? `+${s.newUsersThisWeek} minggu ini` : undefined}
        />
        <StatCard
          label="Total Playlists"
          value={s?.totalPlaylists ?? 0}
          icon={ListMusic}
          accentColor="text-blue-400"
        />
        <StatCard
          label="Lagu Difavoritkan"
          value={s?.totalLikedSongs ?? 0}
          icon={Heart}
          accentColor="text-pink-400"
        />
        <StatCard
          label="Total Diputar"
          value={s?.totalPlays ?? 0}
          icon={PlayCircle}
          accentColor="text-purple-400"
        />
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Ulasan"
          value={s?.totalReviews ?? 0}
          icon={MessageSquareText}
          accentColor="text-orange-400"
        />
        <StatCard
          label="Rata-rata Rating"
          value={s?.averageRating ? `${s.averageRating} ★` : '—'}
          icon={Star}
          accentColor="text-yellow-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Registration Trend */}
        <ChartCard title="Pendaftaran User (30 Hari)">
          {regData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={regData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: '#333' }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: '#333' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#1ed760" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[240px] items-center justify-center text-[13px] text-[#555]">Belum ada data pendaftaran</p>
          )}
        </ChartCard>

        {/* Daily Plays */}
        <ChartCard title="Aktivitas Putar (30 Hari)">
          {playData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={playData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: '#333' }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: '#333' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[240px] items-center justify-center text-[13px] text-[#555]">Belum ada data aktivitas</p>
          )}
        </ChartCard>

        {/* Top Songs */}
        <ChartCard title="Top 10 Lagu Diputar">
          {(charts?.topSongs?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts!.topSongs} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: '#333' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fill: '#999', fontSize: 11 }}
                  axisLine={false}
                  width={80}
                  tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 14) + '…' : v)}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload?.[0]) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl">
                          <p className="text-[12px] font-semibold text-white">{d.title}</p>
                          <p className="text-[11px] text-[#888]">{d.artist}</p>
                          <p className="mt-1 text-[13px] font-bold text-primary">{d.count}x diputar</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#1ed760" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[280px] items-center justify-center text-[13px] text-[#555]">Belum ada data lagu</p>
          )}
        </ChartCard>

        {/* Auth Provider Breakdown */}
        <ChartCard title="Metode Login User">
          {(charts?.authProviders?.length ?? 0) > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={charts!.authProviders}
                    dataKey="count"
                    nameKey="provider"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    strokeWidth={0}
                    label={({ provider, count }: any) => `${provider} (${count})`}
                  >
                    {charts!.authProviders.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload?.[0]) {
                        return (
                          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl">
                            <p className="text-[12px] font-semibold text-white capitalize">{payload[0].name}</p>
                            <p className="text-[13px] font-bold text-primary">{payload[0].value} user</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="flex h-[280px] items-center justify-center text-[13px] text-[#555]">Belum ada data</p>
          )}
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-[#888]">
            <UserPlus className="h-4 w-4" />
            User Terbaru
          </h3>
          <div className="space-y-3">
            {(stats?.recentUsers || []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                  {u.avatar ? (
                    <img src={u.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    u.username[0].toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white">{u.username}</p>
                  <p className="truncate text-[11px] text-[#666]">{u.email}</p>
                </div>
                <span className="shrink-0 text-[10px] text-[#555]">
                  {new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
            {(stats?.recentUsers || []).length === 0 && (
              <p className="py-4 text-center text-[13px] text-[#555]">Belum ada user</p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-[#888]">
            <MessageSquareText className="h-4 w-4" />
            Ulasan Terbaru
          </h3>
          <div className="space-y-3">
            {(stats?.recentReviews || []).map((r: any) => (
              <div key={r.id} className="rounded-lg bg-white/[0.02] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-white">{r.user?.username}</span>
                  <span className="text-[12px] text-yellow-400">{'★'.repeat(r.rating)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] text-[#888]">{r.review}</p>
              </div>
            ))}
            {(stats?.recentReviews || []).length === 0 && (
              <p className="py-4 text-center text-[13px] text-[#555]">Belum ada ulasan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
