"use client";
// src/app/admin/cms/new/page.tsx
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");
}

export default function NewCmsPage() {
  const router = useRouter();
  const sp     = useSearchParams();
  const [form, setForm] = useState({ title: sp.get("title") ?? "", slug: sp.get("slug") ?? "", content: "", published: true });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleTitle(title: string) {
    setForm(f => ({ ...f, title, slug: f.slug === slugify(f.title) ? slugify(title) : f.slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError("");
    const res = await fetch("/api/admin/cms", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const d   = await res.json();
    if (!res.ok) { setError(d.error); setSaving(false); return; }
    router.push("/admin/cms");
  }

  return (
    <div className="max-w-3xl animate-fade-up">
      <nav className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <button onClick={() => router.push("/admin/cms")} className="hover:text-brand-600 transition-colors">CMS Pages</button>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">New page</span>
      </nav>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Create new page</h1>

        {error && (
          <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Page title</label>
          <input id="title" required value={form.title} onChange={e => handleTitle(e.target.value)} placeholder="e.g. About Us"
            className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">
            URL slug <span className="text-gray-400 font-normal text-xs">(auto-generated)</span>
          </label>
          <div className="flex items-center">
            <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 font-mono">/</span>
            <input id="slug" required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="about-us" pattern="[a-z0-9-]+"
              className="input-brand flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-sm bg-gray-50 font-mono" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers and hyphens only</p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
          <textarea id="content" required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={12} placeholder="Write your page content here..."
            className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 resize-y font-mono" />
          <p className="text-xs text-gray-400 mt-1">Plain text or basic HTML supported</p>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={form.published}
            onClick={() => setForm(f => ({ ...f, published: !f.published }))}
            className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${form.published ? "bg-brand-600" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <label className="text-sm text-gray-700 cursor-pointer" onClick={() => setForm(f => ({ ...f, published: !f.published }))}>
            {form.published ? "Published" : "Draft"}
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="btn-brand flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            {saving ? "Creating..." : "Create page"}
          </button>
          <button type="button" onClick={() => router.push("/admin/cms")}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
