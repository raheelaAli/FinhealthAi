"use client";
// src/app/dashboard/admin/page.tsx
// Role-gated: only ADMIN users can see this

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers:        number;
  premiumUsers:      number;
  totalTransactions: number;
  totalHealthLogs:   number;
  totalAiInsights:   number;
}

interface UserRow {
  id:        string;
  name:      string | null;
  email:     string;
  role:      string;
  createdAt: string;
  _count:    { transactions: number; healthLogs: number; aiInsights: number };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats,  setStats]  = useState<Stats | null>(null);
  const [users,  setUsers]  = useState<UserRow[]>([]);
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetch("/api/admin")
      .then(r => r.json())
      .then(d => { setStats(d.stats); setUsers(d.recentUsers ?? []); setLoading(false); });
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total users",       value: stats?.totalUsers,        icon: "👥", color: "text-blue-600"   },
    { label: "Premium users",     value: stats?.premiumUsers,       icon: "⭐", color: "text-amber-600"  },
    { label: "Transactions",      value: stats?.totalTransactions,  icon: "₨",  color: "text-emerald-600"},
    { label: "Health logs",       value: stats?.totalHealthLogs,    icon: "❤️", color: "text-red-500"   },
    { label: "AI queries",        value: stats?.totalAiInsights,    icon: "✦",  color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and user management</p>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
          Admin only
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xl mb-1">{c.icon}</p>
            <p className="text-xs text-gray-400 font-medium">{c.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${c.color}`}>
              {c.value?.toLocaleString() ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* User table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Recent users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-3 font-medium">User</th>
                <th className="text-left pb-3 font-medium">Role</th>
                <th className="text-center pb-3 font-medium">Transactions</th>
                <th className="text-center pb-3 font-medium">Health logs</th>
                <th className="text-center pb-3 font-medium">AI queries</th>
                <th className="text-left pb-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-gray-900">{u.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      u.role === "ADMIN"   ? "bg-red-100 text-red-700" :
                      u.role === "PREMIUM" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-center text-gray-700">{u._count.transactions}</td>
                  <td className="py-3 text-center text-gray-700">{u._count.healthLogs}</td>
                  <td className="py-3 text-center text-gray-700">{u._count.aiInsights}</td>
                  <td className="py-3 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
