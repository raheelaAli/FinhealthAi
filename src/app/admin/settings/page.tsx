"use client";
// src/app/admin/settings/page.tsx
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      setEmail(d.settings?.contactEmail ?? ""); setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(""); setSaved(false);
    const res  = await fetch("/api/admin/settings", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ contactEmail: email }) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    setSaved(true); setTimeout(() => setSaved(false), 3500);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-xl space-y-6 animate-fade-up">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Admin panel configuration</p>
      </header>

      {/* Contact email card */}
      <section aria-labelledby="contact-email-heading">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 id="contact-email-heading" className="font-semibold text-gray-900 mb-1">Contact email</h2>
          <p className="text-sm text-gray-500 mb-5">
            This address receives messages submitted via the Contact Us form on the public site.
          </p>

          {error && (
            <div role="alert" className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}
          {saved && (
            <div role="status" className="mb-4 p-3.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Settings saved successfully
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                id="contactEmail" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50"
              />
            </div>
            <button type="submit" disabled={saving}
              className="btn-brand w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
              {saving ? "Saving..." : "Save settings"}
            </button>
          </form>
        </div>
      </section>

      {/* Info card */}
      <section aria-labelledby="access-info-heading">
        <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-5">
          <h2 id="access-info-heading" className="font-semibold text-gray-900 mb-4 text-sm">Access information</h2>
          <dl className="space-y-2.5 text-sm">
            {[
              { label: "Admin URL",  value: "/admin",      mono: true },
              { label: "Login URL",  value: "/auth/login", mono: true },
              { label: "Access",     value: "ADMIN role only", badge: true },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <dt className="text-gray-400">{row.label}</dt>
                <dd>
                  {row.badge ? (
                    <span className="badge-brand">ADMIN</span>
                  ) : (
                    <code className="text-xs bg-white border border-brand-100 text-brand-700 px-2 py-0.5 rounded-lg font-mono">{row.value}</code>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
