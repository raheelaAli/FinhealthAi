"use client";
// src/app/dashboard/goals/page.tsx — with add, edit, delete, progress update

import { useEffect, useState, useCallback } from "react";
import { useAlerts } from "@/context/alerts-context";

interface Goal {
  id: string; title: string; description: string | null;
  type: string; target: number; current: number;
  unit: string; deadline: string | null; achieved: boolean;
}

const emptyForm = { title: "", description: "", type: "health", target: "", unit: "", deadline: "" };

export default function GoalsPage() {
  const { refresh: refreshAlerts } = useAlerts();
  const [goals,     setGoals]    = useState<Goal[]>([]);
  const [loading,   setLoading]  = useState(true);
  const [showForm,  setShowForm] = useState(false);
  const [editGoal,  setEditGoal] = useState<Goal | null>(null);
  const [form,      setForm]     = useState(emptyForm);
  const [saving,    setSaving]   = useState(false);
  // For inline progress update
  const [updatingId,  setUpdatingId]  = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState<Record<string, string>>({});

  const loadGoals = useCallback(async () => {
    const res  = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data.goals ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  function openEdit(g: Goal) {
    setEditGoal(g);
    setForm({
      title:       g.title,
      description: g.description ?? "",
      type:        g.type,
      target:      String(g.target),
      unit:        g.unit,
      deadline:    g.deadline ? new Date(g.deadline).toISOString().split("T")[0] : "",
    });
    setShowForm(true);
  }

  function openAdd() {
    setEditGoal(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, target: parseFloat(form.target) };

    if (editGoal) {
      await fetch(`/api/goals/${editGoal.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
    } else {
      await fetch("/api/goals", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
    }
    setSaving(false);
    setShowForm(false);
    setEditGoal(null);
    setForm(emptyForm);
    loadGoals();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  async function handleProgressUpdate(g: Goal) {
    const val = parseFloat(progressVal[g.id] ?? "");
    if (isNaN(val)) return;
    setUpdatingId(g.id);
    await fetch(`/api/goals/${g.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ current: val }),
    });
    setUpdatingId(null);
    setProgressVal(prev => ({ ...prev, [g.id]: "" }));
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
          <p className="text-gray-500 text-sm mt-1">Set targets, log progress, celebrate wins</p>
        </div>
        <button onClick={openAdd}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
          + New goal
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{editGoal ? "Edit goal" : "New goal"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
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
              <input required value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="steps, kg, PKR..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline <span className="text-gray-400">(optional)</span></label>
              <input type="date" value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 text-white text-sm py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : editGoal ? "Save changes" : "Add goal"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditGoal(null); }}
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
            return (
              <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{g.type === "health" ? "❤️" : "₨"}</span>
                      <p className="font-medium text-gray-900">{g.title}</p>
                    </div>
                    {g.description && <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(g)}
                      className="text-xs text-gray-400 hover:text-emerald-600 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-emerald-300">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(g.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-red-300">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{g.current.toLocaleString()} / {g.target.toLocaleString()} {g.unit}</span>
                    <span className={`font-semibold ${pct >= 100 ? "text-emerald-600" : "text-gray-700"}`}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  {g.deadline && (
                    <p className="text-xs text-gray-400">
                      Deadline: {new Date(g.deadline).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}

                  {/* Inline progress update */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number" min="0"
                      value={progressVal[g.id] ?? ""}
                      onChange={e => setProgressVal(prev => ({ ...prev, [g.id]: e.target.value }))}
                      placeholder={`Update progress (${g.unit})`}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleProgressUpdate(g)}
                      disabled={updatingId === g.id || !progressVal[g.id]}
                      className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-200 disabled:opacity-40 transition-colors font-medium"
                    >
                      {updatingId === g.id ? "..." : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {active.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
              No active goals. Click "+ New goal" to start!
            </div>
          )}
        </div>
      </div>

      {/* Achieved */}
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
