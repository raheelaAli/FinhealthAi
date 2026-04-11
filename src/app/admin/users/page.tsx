"use client";
// src/app/admin/users/page.tsx
import { useEffect, useState } from "react";

interface User {
  id: string; name: string | null; email: string; role: string;
  createdAt: string; totalUsage: number;
  _count: { transactions: number; healthLogs: number; aiInsights: number; goals: number };
}

export default function AdminUsersPage() {
  const [users, setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]  = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => { setUsers(d.users ?? []); setLoading(false); });
  }, []);

  const maxUsage = Math.max(...users.map(u => u.totalUsage), 1);
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total registered users</p>
        </div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium w-40">Activity</th>
              <th className="text-center px-4 py-3 font-medium">₨ Tx</th>
              <th className="text-center px-4 py-3 font-medium">❤️ Health</th>
              <th className="text-center px-4 py-3 font-medium">✦ AI</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const pct = maxUsage > 0 ? Math.round((u.totalUsage / maxUsage) * 100) : 0;
              return (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{u.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      u.role === "ADMIN" ? "bg-emerald-100 text-emerald-700" :
                      u.role === "PREMIUM" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">{u.totalUsage}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-700 font-medium">{u._count.transactions}</td>
                  <td className="px-4 py-4 text-center text-gray-700 font-medium">{u._count.healthLogs}</td>
                  <td className="px-4 py-4 text-center text-gray-700 font-medium">{u._count.aiInsights}</td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
