"use client";
// src/app/admin/cms/page.tsx
import { useEffect, useState } from "react";
import Link from "next/link";

interface CmsPage { id: string; title: string; slug: string; published: boolean; updatedAt: string; }

const PRESETS = [
  { title: "About Us", slug: "about-us" },
  { title: "Privacy Policy", slug: "privacy-policy" },
  { title: "Terms & Conditions", slug: "terms-conditions" },
  { title: "Contact Us", slug: "contact-us" },
];

export default function CmsListPage() {
  const [pages,    setPages]    = useState<CmsPage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms").then(r => r.json()).then(d => { setPages(d.pages ?? []); setLoading(false); });
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/cms/${id}`, { method: "DELETE" });
    setPages(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }

  const existingSlugs = new Set(pages.map(p => p.slug));

  if (loading) return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl animate-fade-up">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage public static content pages</p>
        </div>
        <Link href="/admin/cms/new"
          className="btn-brand text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New page
        </Link>
      </header>

      {/* Quick-create presets */}
      {PRESETS.filter(p => !existingSlugs.has(p.slug)).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-3">Quick-create common pages:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.filter(p => !existingSlugs.has(p.slug)).map(p => (
              <Link key={p.slug}
                href={`/admin/cms/new?title=${encodeURIComponent(p.title)}&slug=${p.slug}`}
                className="text-xs bg-white border border-amber-300 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                + {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <section aria-label="CMS pages">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
          {pages.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-brand-50 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7 text-brand-400" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No pages yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first page using the button above.</p>
            </div>
          ) : (
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {["Title", "Slug", "Status", "Last updated", "Actions"].map(h => (
                    <th key={h} scope="col" className={`px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wide ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 table-row-hover transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900">{p.title}</td>
                    <td className="px-5 py-4">
                      <code className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded-lg font-mono">/{p.slug}</code>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${p.published ? "bg-brand-50 text-brand-700 border-brand-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(p.updatedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/cms/${p.id}`}
                          className="text-xs font-medium text-brand-600 hover:text-brand-800 px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id}
                          className="text-xs font-medium text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40">
                          {deleting === p.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
