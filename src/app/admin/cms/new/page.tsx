"use client";
// src/app/admin/cms/new/page.tsx
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function NewCmsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    title:     searchParams.get("title") ?? "",
    slug:      searchParams.get("slug")  ?? "",
    content:   "",
    published: true,
  });
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  function handleTitleChange(title: string) {
    setForm(f => ({ ...f, title, slug: f.slug === slugify(f.title) ? slugify(title) : f.slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const res  = await fetch("/api/admin/cms", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    router.push("/admin/cms");
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/admin/cms")} className="text-gray-400 hover:text-gray-700 text-sm">← CMS Pages</button>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">New page</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {error && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input required value={form.title} onChange={e => handleTitleChange(e.target.value)}
            placeholder="e.g. About Us"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <div className="flex items-center">
            <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">/</span>
            <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="about-us" pattern="[a-z0-9-]+"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers and hyphens only</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={12} placeholder="Write your page content here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y font-mono" />
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-checked:bg-emerald-500 rounded-full transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
          </label>
          <span className="text-sm text-gray-700">Published</span>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm">
            {saving ? "Saving..." : "Create page"}
          </button>
          <button type="button" onClick={() => router.push("/admin/cms")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
