"use client";
// src/app/admin/users/page.tsx
import { useEffect, useState } from "react";

interface User {
  id: string; name: string | null; email: string; role: string;
  createdAt: string; totalUsage: number;
  _count: { transactions: number; healthLogs: number; aiInsights: number; goals: number };
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => { setUsers(d.users ?? []); setLoading(false); });
  }, []);

  const maxUsage = Math.max(...users.map(u => u.totalUsage), 1);
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64" role="status" aria-label="Loading users">
      <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const roleColors: Record<string, string> = {
    ADMIN:   "bg-red-100 text-red-700 border-red-200",
    PREMIUM: "bg-amber-100 text-amber-700 border-amber-200",
    USER:    "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-up">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total registered users</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            aria-label="Search users by name or email"
            className="input-brand pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white w-64"
          />
        </div>
      </header>

      <section aria-label="Users table">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {["User", "Role", "Activity", "₨ Transactions", "❤️ Health", "✦ AI", "Joined"].map(h => (
                  <th key={h} scope="col" className={`px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wide ${h === "User" ? "text-left" : h === "Role" || h === "Joined" ? "text-left" : "text-center"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const pct = Math.round((u.totalUsage / maxUsage) * 100);
                return (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 table-row-hover transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleColors[u.role] ?? roleColors.USER}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="progress-bar h-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right font-medium">{u.totalUsage}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-gray-700">{u._count.transactions}</td>
                    <td className="px-5 py-4 text-center font-semibold text-gray-700">{u._count.healthLogs}</td>
                    <td className="px-5 py-4 text-center font-semibold text-gray-700">{u._count.aiInsights}</td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-gray-400 text-sm">No users found{search ? ` matching "${search}"` : ""}.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
