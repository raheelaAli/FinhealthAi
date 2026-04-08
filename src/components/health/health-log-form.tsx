"use client";
// src/components/health/health-log-form.tsx

import { useState } from "react";

interface Props {
  onSuccess: () => void;
}

export function HealthLogForm({ onSuccess }: Props) {
  const [form, setForm] = useState({
    date:     new Date().toISOString().split("T")[0],
    steps:    "",
    sleepHrs: "",
    waterL:   "",
    mood:     "",
    weight:   "",
    notes:    "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const payload: Record<string, any> = { date: form.date };
    if (form.steps)    payload.steps    = parseInt(form.steps);
    if (form.sleepHrs) payload.sleepHrs = parseFloat(form.sleepHrs);
    if (form.waterL)   payload.waterL   = parseFloat(form.waterL);
    if (form.mood)     payload.mood     = parseInt(form.mood);
    if (form.weight)   payload.weight   = parseFloat(form.weight);
    if (form.notes)    payload.notes    = form.notes;

    const res = await fetch("/api/health", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error); return; }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    onSuccess();
  }

  const moodLabels: Record<string, string> = {
    "1": "😞 Bad", "2": "😕 Poor", "3": "😐 Okay", "4": "🙂 Good", "5": "😄 Great",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          ✓ Health log saved!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">👟 Steps</label>
          <input
            type="number" min="0" value={form.steps}
            onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
            placeholder="e.g. 8000"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">😴 Sleep (hrs)</label>
          <input
            type="number" min="0" max="24" step="0.5" value={form.sleepHrs}
            onChange={e => setForm(f => ({ ...f, sleepHrs: e.target.value }))}
            placeholder="e.g. 7.5"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">💧 Water (litres)</label>
          <input
            type="number" min="0" step="0.1" value={form.waterL}
            onChange={e => setForm(f => ({ ...f, waterL: e.target.value }))}
            placeholder="e.g. 2.0"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">⚖️ Weight (kg)</label>
          <input
            type="number" min="0" step="0.1" value={form.weight}
            onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
            placeholder="e.g. 72.5"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
      </div>

      {/* Mood slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mood — {form.mood ? moodLabels[form.mood] : "Not set"}
        </label>
        <input
          type="range" min="1" max="5" step="1"
          value={form.mood || "3"}
          onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}
          className="w-full accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>😞</span><span>😕</span><span>😐</span><span>🙂</span><span>😄</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text" value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="How are you feeling today?"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        {loading ? "Saving..." : "Save today's log"}
      </button>
    </form>
  );
}
