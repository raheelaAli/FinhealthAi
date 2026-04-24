"use client";
// src/app/admin/cms/[id]/page.tsx
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCmsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
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
    e.preventDefault(); setSaving(true); setError("");
    const res = await fetch(`/api/admin/cms/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const d   = await res.json();
    if (!res.ok) { setError(d.error); setSaving(false); return; }
    router.push("/admin/cms");
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl animate-fade-up">
      <nav className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <button onClick={() => router.push("/admin/cms")} className="hover:text-brand-600 transition-colors">CMS Pages</button>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">Edit: {form.title}</span>
      </nav>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Edit page</h1>

        {error && (
          <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input id="title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50" />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
          <div className="flex items-center">
            <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 font-mono">/</span>
            <input id="slug" required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} pattern="[a-z0-9-]+"
              className="input-brand flex-1 px-4 py-3 border border-gray-200 rounded-r-xl text-sm bg-gray-50 font-mono" />
          </div>
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
          <textarea id="content" required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={12} className="input-brand w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 resize-y font-mono" />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={form.published}
            onClick={() => setForm(f => ({ ...f, published: !f.published }))}
            className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${form.published ? "bg-brand-600" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <span className="text-sm text-gray-700">{form.published ? "Published" : "Draft"}</span>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="btn-brand flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            {saving ? "Saving..." : "Save changes"}
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
