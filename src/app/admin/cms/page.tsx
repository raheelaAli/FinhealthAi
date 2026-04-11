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
  const [pages, setPages]     = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadPages = () =>
    fetch("/api/admin/cms").then(r => r.json()).then(d => { setPages(d.pages ?? []); setLoading(false); });

  useEffect(() => { loadPages(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/cms/${id}`, { method: "DELETE" });
    setPages(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }

  const existingSlugs = new Set(pages.map(p => p.slug));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage static content pages</p>
        </div>
        <Link href="/admin/cms/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
          + New page
        </Link>
      </div>

      {PRESETS.filter(p => !existingSlugs.has(p.slug)).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-3">Quick create common pages:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.filter(p => !existingSlugs.has(p.slug)).map(p => (
              <Link key={p.slug}
                href={`/admin/cms/new?title=${encodeURIComponent(p.title)}&slug=${p.slug}`}
                className="text-xs bg-white border border-amber-300 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                + {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-500 text-sm">No pages yet. Create your first page above.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                  <td className="px-4 py-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">/{p.slug}</code>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      p.published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {new Date(p.updatedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/cms/${p.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">Edit</Link>
                      <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50">
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
    </div>
  );
}
