"use client";
// src/app/admin/page.tsx
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Stats {
  totalUsers: number; totalUsage: number; totalTransactions: number;
  totalHealthLogs: number; totalAiInsights: number; activeUsers: number;
}
interface ChartPoint {
  label: string; newUsers: number; transactions: number;
  aiQueries: number; healthLogs: number; totalUsage: number;
}

const statCards = (stats: Stats | null) => [
  { label: "Total users",      value: stats?.totalUsers,        color: "text-blue-600",    bg: "from-blue-50 to-blue-100/50",    border: "border-blue-200",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-500" aria-hidden="true"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
  },
  { label: "Active (7 days)",  value: stats?.activeUsers,       color: "text-brand-600",   bg: "from-brand-50 to-brand-100/50",  border: "border-brand-200",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-brand-500" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  },
  { label: "Total usage",      value: stats?.totalUsage,        color: "text-violet-600",  bg: "from-violet-50 to-violet-100/50", border: "border-violet-200",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-violet-500" aria-hidden="true"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>,
  },
  { label: "Transactions",     value: stats?.totalTransactions, color: "text-amber-600",   bg: "from-amber-50 to-amber-100/50",  border: "border-amber-200",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-500" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>,
  },
  { label: "Health logs",      value: stats?.totalHealthLogs,   color: "text-rose-500",    bg: "from-rose-50 to-rose-100/50",    border: "border-rose-200",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-500" aria-hidden="true"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>,
  },
  { label: "AI queries",       value: stats?.totalAiInsights,   color: "text-indigo-600",  bg: "from-indigo-50 to-indigo-100/50", border: "border-indigo-200",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500" aria-hidden="true"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>,
  },
];

const tooltipStyle = { fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

export default function AdminDashboard() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => {
      setStats(d.stats); setChartData(d.chartData ?? []); setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64" role="status" aria-label="Loading dashboard">
      <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl animate-fade-up">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform analytics — last 14 days</p>
      </header>

      {/* Stat cards */}
      <section aria-label="Platform statistics">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards(stats).map(c => (
            <div key={c.label} className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-4 stat-card`}>
              <div className="mb-3">{c.icon}</div>
              <p className="text-[11px] text-gray-500 font-medium leading-tight">{c.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${c.color}`}>{c.value?.toLocaleString() ?? "0"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section aria-label="Usage charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-1">Daily usage</h2>
          <p className="text-xs text-gray-400 mb-5">All user actions over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="totalUsage" stroke="#16a34a" strokeWidth={2.5} dot={false} name="Total" />
              <Line type="monotone" dataKey="transactions" stroke="#0d9488" strokeWidth={1.5} dot={false} name="Transactions" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="aiQueries" stroke="#7c3aed" strokeWidth={1.5} dot={false} name="AI queries" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-1">New registrations</h2>
          <p className="text-xs text-gray-400 mb-5">Users joined per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="newUsers" fill="#16a34a" radius={[5, 5, 0, 0]} maxBarSize={28} name="New users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Activity breakdown */}
      <section aria-label="Activity breakdown">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
          <h2 className="font-semibold text-gray-900 mb-1">Activity breakdown</h2>
          <p className="text-xs text-gray-400 mb-5">Daily actions by type — stacked</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="transactions" fill="#16a34a" radius={[0,0,0,0]} maxBarSize={22} name="Transactions" stackId="a" />
              <Bar dataKey="healthLogs"   fill="#0d9488" radius={[0,0,0,0]} maxBarSize={22} name="Health logs"  stackId="a" />
              <Bar dataKey="aiQueries"    fill="#7c3aed" radius={[4,4,0,0]} maxBarSize={22} name="AI queries"   stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
