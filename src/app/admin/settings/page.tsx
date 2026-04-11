"use client";
// src/app/admin/settings/page.tsx
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      setEmail(d.settings?.contactEmail ?? ""); setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    const res  = await fetch("/api/admin/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactEmail: email }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Admin configuration</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Contact email</h2>
        <p className="text-sm text-gray-500 mb-4">Receives messages from the contact form on the app.</p>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        {saved && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">✓ Settings saved</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Access info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Admin URL</span>
            <code className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded">/admin</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Login URL</span>
            <code className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded">/auth/login</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Access</span>
            <span className="text-emerald-600 font-medium text-xs">ADMIN role only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
