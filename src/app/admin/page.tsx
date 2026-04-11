"use client";
// src/app/admin/page.tsx
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

interface Stats {
  totalUsers: number; totalUsage: number; totalTransactions: number;
  totalHealthLogs: number; totalAiInsights: number; activeUsers: number;
}
interface ChartPoint {
  label: string; newUsers: number; transactions: number;
  aiQueries: number; healthLogs: number; totalUsage: number;
}

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
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: "Total users",    value: stats?.totalUsers,        color: "text-blue-600",    bg: "bg-blue-50",    icon: "👥" },
    { label: "Active (7d)",    value: stats?.activeUsers,       color: "text-emerald-600", bg: "bg-emerald-50", icon: "🟢" },
    { label: "Total usage",    value: stats?.totalUsage,        color: "text-purple-600",  bg: "bg-purple-50",  icon: "📊" },
    { label: "Transactions",   value: stats?.totalTransactions, color: "text-amber-600",   bg: "bg-amber-50",   icon: "₨"  },
    { label: "Health logs",    value: stats?.totalHealthLogs,   color: "text-red-500",     bg: "bg-red-50",     icon: "❤️" },
    { label: "AI queries",     value: stats?.totalAiInsights,   color: "text-indigo-600",  bg: "bg-indigo-50",  icon: "✦"  },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview — last 14 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
            <p className="text-lg mb-1">{c.icon}</p>
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${c.color}`}>{c.value?.toLocaleString() ?? "0"}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Daily usage</h2>
          <p className="text-xs text-gray-400 mb-4">All user actions over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Line type="monotone" dataKey="totalUsage" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Total" />
              <Line type="monotone" dataKey="transactions" stroke="#059669" strokeWidth={1.5} dot={false} name="Transactions" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="aiQueries" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="AI queries" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">New registrations</h2>
          <p className="text-xs text-gray-400 mb-4">Users joined per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="newUsers" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} name="New users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Activity breakdown</h2>
        <p className="text-xs text-gray-400 mb-4">Actions by type per day</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="transactions" fill="#059669" radius={[0,0,0,0]} maxBarSize={20} name="Transactions" stackId="a" />
            <Bar dataKey="healthLogs"   fill="#3b82f6" radius={[0,0,0,0]} maxBarSize={20} name="Health logs"  stackId="a" />
            <Bar dataKey="aiQueries"    fill="#8b5cf6" radius={[4,4,0,0]} maxBarSize={20} name="AI queries"   stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
