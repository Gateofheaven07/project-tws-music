'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
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

const CHART_COLORS = ['#1ed760', '#1db954', '#17a74a', '#128a3d', '#0d6d31', '#095a27', '#06421c', '#042d13'];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111] p-6">
      <h3 className="mb-6 text-[14px] font-bold tracking-tight text-white">{title}</h3>
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

export default function AdminAnalyticsPage() {
  const { fetchAnalytics } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAnalytics();
        setData({
          registrations: res.registrations.map((r: any) => ({
            date: new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
            count: r.count,
          })),
          topSongs: res.topSongs,
          topArtists: res.topArtists,
          genres: res.genres,
        });
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <p className="text-[13px] text-[#666]">Memuat data analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-white">Analytics</h1>
        <p className="mt-1 text-[13px] text-[#666]">Data mendalam mengenai aktivitas dan tren platform</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Registration Trend */}
        <div className="lg:col-span-2">
          <ChartCard title="Tren Pendaftaran User (30 Hari Terakhir)">
            {(data?.registrations?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.registrations} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 12 }} axisLine={{ stroke: '#333' }} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} axisLine={{ stroke: '#333' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" stroke="#1ed760" strokeWidth={3} dot={{ r: 4, fill: '#1ed760' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-[300px] items-center justify-center text-[13px] text-[#555]">Belum ada data pendaftaran</p>
            )}
          </ChartCard>
        </div>

        {/* Top 10 Songs */}
        <ChartCard title="Top 10 Lagu Paling Sering Diputar">
          {(data?.topSongs?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.topSongs} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: '#333' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fill: '#999', fontSize: 11 }}
                  axisLine={false}
                  width={100}
                  tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 18) + '…' : v)}
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
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[350px] items-center justify-center text-[13px] text-[#555]">Belum ada data lagu</p>
          )}
        </ChartCard>

        {/* Top 10 Artists */}
        <ChartCard title="Top 10 Artis Paling Sering Diputar">
          {(data?.topArtists?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.topArtists} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: '#333' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="artist"
                  tick={{ fill: '#999', fontSize: 11 }}
                  axisLine={false}
                  width={100}
                  tickFormatter={(v: string) => (v.length > 18 ? v.slice(0, 18) + '…' : v)}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload?.[0]) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl">
                          <p className="text-[12px] font-semibold text-white">{d.artist}</p>
                          <p className="mt-1 text-[13px] font-bold text-primary">{d.count}x diputar</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[350px] items-center justify-center text-[13px] text-[#555]">Belum ada data artis</p>
          )}
        </ChartCard>

        {/* Genre Distribution */}
        <div className="lg:col-span-2">
          <ChartCard title="Distribusi Genre Paling Disukai (Top 10)">
            {(data?.genres?.length ?? 0) > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={data.genres}
                      dataKey="count"
                      nameKey="genre"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
                      strokeWidth={0}
                      label={({ genre, count }: any) => `${genre} (${count})`}
                    >
                      {data.genres.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload?.[0]) {
                          return (
                            <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl">
                              <p className="text-[12px] font-semibold text-white capitalize">{payload[0].name}</p>
                              <p className="text-[13px] font-bold text-primary">{payload[0].value} disukai</p>
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
              <p className="flex h-[350px] items-center justify-center text-[13px] text-[#555]">Belum ada data genre</p>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
