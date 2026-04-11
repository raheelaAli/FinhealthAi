"use client";
// src/app/admin/cms/[id]/page.tsx
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCmsPage() {
  const router  = useRouter();
  const params  = useParams();
  const id      = params.id as string;
  const [form, setForm]     = useState({ title: "", slug: "", content: "", published: true });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/cms/${id}`).then(r => r.json()).then(d => {
      if (d.page) setForm({ title: d.page.title, slug: d.page.slug, content: d.page.content, published: d.page.published });
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const res  = await fetch(`/api/admin/cms/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    router.push("/admin/cms");
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/admin/cms")} className="text-gray-400 hover:text-gray-700 text-sm">← CMS Pages</button>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">Edit: {form.title}</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <div className="flex items-center">
            <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">/</span>
            <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              pattern="[a-z0-9-]+"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={12}
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
            {saving ? "Saving..." : "Save changes"}
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
