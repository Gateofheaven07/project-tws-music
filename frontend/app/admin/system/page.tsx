'use client';

import { useEffect, useState } from 'react';
import { useAdmin, type SystemHealth } from '@/hooks/useAdmin';
import {
  Server,
  Database,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSystemPage() {
  const { fetchSystemHealth } = useAdmin();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadHealth = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemHealth();
      setHealth(data);
      setLastRefreshed(new Date());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
    
    // Auto refresh every 30s
    const timer = setInterval(() => {
      loadHealth();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !health) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <p className="text-[13px] text-[#666]">Memuat status sistem...</p>
        </div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${seconds % 60}s`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-white">System Health</h1>
          <p className="mt-1 text-[13px] text-[#666]">Monitoring status backend, database, dan environment</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#666]">
            Terakhir update: {lastRefreshed.toLocaleTimeString('id-ID')}
          </span>
          <button
            onClick={loadHealth}
            disabled={loading}
            className="rounded-lg bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.08] disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Overall Status */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111] p-6">
          <div className="flex items-start justify-between">
            <h3 className="flex items-center gap-2 text-[14px] font-bold tracking-tight text-white">
              <Activity className="h-4 w-4" /> Status Keseluruhan
            </h3>
            {health?.overall === 'healthy' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Degraded
              </span>
            )}
          </div>
          
          <div className="mt-6 space-y-4">
            {/* Database Status */}
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-blue-500/10 p-2 text-blue-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">Database (PostgreSQL)</p>
                  <p className="text-[11px] text-[#888]">Latency: {health?.database.latencyMs}ms</p>
                </div>
              </div>
              {health?.database.status === 'ok' ? (
                <span className="text-[12px] font-medium text-emerald-400">Connected</span>
              ) : (
                <span className="text-[12px] font-medium text-red-400">Failed</span>
              )}
            </div>

            {/* Environment Status */}
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-purple-500/10 p-2 text-purple-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">Environment Config</p>
                  <p className="text-[11px] text-[#888]">
                    {health?.environment.missing.length === 0 ? 'Semua variabel terisi' : `${health?.environment.missing.length} variabel hilang`}
                  </p>
                </div>
              </div>
              {health?.environment.status === 'complete' ? (
                <span className="text-[12px] font-medium text-emerald-400">Complete</span>
              ) : (
                <span className="text-[12px] font-medium text-amber-400">Incomplete</span>
              )}
            </div>
          </div>
        </div>

        {/* Runtime Metrics */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111] p-6">
          <h3 className="mb-6 flex items-center gap-2 text-[14px] font-bold tracking-tight text-white">
            <Cpu className="h-4 w-4" /> Runtime Metrics
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-4">
              <Clock className="mb-2 h-5 w-5 text-[#666]" />
              <p className="text-[20px] font-bold text-white">{formatUptime(health?.runtime.uptime ?? 0)}</p>
              <p className="text-[11px] uppercase tracking-wider text-[#666]">Uptime</p>
            </div>
            
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-4">
              <HardDrive className="mb-2 h-5 w-5 text-[#666]" />
              <p className="text-[20px] font-bold text-white">{health?.runtime.memoryUsage.rss} MB</p>
              <p className="text-[11px] uppercase tracking-wider text-[#666]">Memory (RSS)</p>
            </div>

            <div className="col-span-2 rounded-lg border border-white/[0.04] bg-white/[0.01] p-4">
              <Globe className="mb-2 h-5 w-5 text-[#666]" />
              <div className="flex justify-between">
                <div>
                  <p className="text-[14px] font-medium text-white">Node {health?.runtime.nodeVersion}</p>
                  <p className="text-[11px] text-[#666]">{health?.runtime.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium text-white">{health?.runtime.isVercel ? 'Vercel' : 'Local / Custom'}</p>
                  <p className="text-[11px] text-[#666]">{health?.runtime.vercelRegion || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Variables Detail */}
        {health?.environment.missing && health.environment.missing.length > 0 && (
          <div className="col-span-1 md:col-span-2 rounded-xl border border-amber-500/20 bg-[#111] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-[14px] font-bold tracking-tight text-amber-400">
              <AlertTriangle className="h-4 w-4" /> Variabel Environment yang Hilang
            </h3>
            <p className="mb-4 text-[13px] text-[#888]">Variabel berikut ini perlu diset di file .env backend agar sistem berjalan normal:</p>
            <div className="flex flex-wrap gap-2">
              {health.environment.missing.map((key) => (
                <span key={key} className="rounded-md bg-amber-500/10 px-2.5 py-1 text-[12px] font-mono text-amber-400">
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
