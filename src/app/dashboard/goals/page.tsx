"use client";
// src/app/dashboard/goals/page.tsx — with inline progress update

import { useEffect, useState, useCallback } from "react";
import { useAlerts } from "@/context/alerts-context";

interface Goal {
  id: string; title: string; description: string | null;
  type: string; target: number; current: number;
  unit: string; deadline: string | null; achieved: boolean;
}

export default function GoalsPage() {
  const { refresh: refreshAlerts } = useAlerts();
  const [goals,     setGoals]    = useState<Goal[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [showForm,  setShowForm] = useState(false);
  const [editingId, setEditingId]= useState<string | null>(null);
  const [editVal,   setEditVal]  = useState("");
  const [saving,    setSaving]   = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "health",
    target: "", unit: "", deadline: "",
  });

  const loadGoals = useCallback(async () => {
    const res  = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data.goals ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/goals", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...form, target: parseFloat(form.target) }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ title: "", description: "", type: "health", target: "", unit: "", deadline: "" });
    loadGoals();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  async function handleUpdateProgress(goal: Goal) {
    const val = parseFloat(editVal);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    await fetch("/api/goals", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: goal.id, current: val }),
    });
    setSaving(false);
    setEditingId(null);
    setEditVal("");
    await loadGoals();
    await refreshAlerts();
  }

  const active   = goals.filter(g => !g.achieved);
  const achieved = goals.filter(g => g.achieved);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-500 text-sm mt-1">Set targets, update progress, celebrate wins</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
          + New goal
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">New goal</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Walk 8,000 steps daily"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="health">❤️ Health</option>
                <option value="finance">₨ Finance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <input required type="number" min="1" value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                placeholder="e.g. 8000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input required value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="e.g. steps, kg, PKR"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline <span className="text-gray-400">(optional)</span></label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 text-white text-sm py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Add goal"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-100 text-gray-700 text-sm py-2.5 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Active goals */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active — {active.length}</h2>
        <div className="space-y-3">
          {active.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            const isEditing = editingId === g.id;
            return (
              <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{g.type === "health" ? "❤️" : "₨"}</span>
                      <p className="font-medium text-gray-900">{g.title}</p>
                    </div>
                    {g.description && <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(g.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 transition-all">
                    Delete
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {g.current.toLocaleString()} / {g.target.toLocaleString()} {g.unit}
                    </span>
                    <span className={`font-semibold ${pct >= 100 ? "text-emerald-600" : "text-gray-700"}`}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>

                  {/* Inline progress update */}
                  {isEditing ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number" min="0" value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        placeholder={`Current ${g.unit}`}
                        className="flex-1 px-3 py-1.5 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateProgress(g)} disabled={saving}
                        className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                        {saving ? "..." : "Save"}
                      </button>
                      <button onClick={() => { setEditingId(null); setEditVal(""); }}
                        className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(g.id); setEditVal(String(g.current)); }}
                      className="text-xs text-emerald-600 hover:text-emerald-800 mt-1 transition-colors">
                      + Update progress
                    </button>
                  )}

                  {g.deadline && (
                    <p className="text-xs text-gray-400">
                      Deadline: {new Date(g.deadline).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {active.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
              No active goals. Click "+ New goal" to add one!
            </div>
          )}
        </div>
      </div>

      {/* Achieved goals */}
      {achieved.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Achieved 🎉 — {achieved.length}</h2>
          <div className="space-y-2">
            {achieved.map(g => (
              <div key={g.id} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-emerald-500 text-lg">✓</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">{g.title}</p>
                  <p className="text-xs text-emerald-600">{g.target.toLocaleString()} {g.unit} — completed!</p>
                </div>
                <button onClick={() => handleDelete(g.id)}
                  className="text-xs text-emerald-400 hover:text-red-500 transition-colors">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
