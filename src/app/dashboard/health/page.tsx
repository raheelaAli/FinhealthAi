"use client";
// src/app/dashboard/health/page.tsx

import { useEffect, useState, useCallback } from "react";
import { HealthLogForm } from "@/components/health/health-log-form";
import { HealthChart }   from "@/components/health/health-chart";
import { useAlerts }     from "@/context/alerts-context";

interface HealthLog {
  id: string; date: string;
  steps: number | null; sleepHrs: number | null;
  waterL: number | null; mood: number | null;
  weight: number | null; notes: string | null;
}

type Metric = "steps" | "sleepHrs" | "waterL" | "mood" | "weight";

const moodEmoji: Record<number, string> = { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

const metrics: { key: Metric; label: string; icon: string; unit: string }[] = [
  { key: "steps",    label: "Steps",  icon: "👟", unit: "steps" },
  { key: "sleepHrs", label: "Sleep",  icon: "😴", unit: "hrs"   },
  { key: "waterL",   label: "Water",  icon: "💧", unit: "L"     },
  { key: "mood",     label: "Mood",   icon: "❤️", unit: "/5"   },
  { key: "weight",   label: "Weight", icon: "⚖️", unit: "kg"   },
];

export default function HealthPage() {
  const { refresh: refreshAlerts } = useAlerts();
  const [logs,         setLogs]    = useState<HealthLog[]>([]);
  const [loading,      setLoading] = useState(true);
  const [activeMetric, setMetric]  = useState<Metric>("steps");

  const loadLogs = useCallback(async () => {
    const res  = await fetch("/api/health?days=30");
    const data = await res.json();
    setLogs(data.logs ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  async function handleLogSaved() {
    await loadLogs();
    await refreshAlerts();
  }

  const recent = logs.slice(0, 7);
  function avg(key: Metric) {
    const vals = recent.map(l => l[key]).filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health</h1>
        <p className="text-gray-500 text-sm mt-1">Log daily metrics and track your 30-day trends</p>
      </div>

      {/* 7-day averages */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map(m => {
          const val = avg(m.key);
          return (
            <div key={m.key} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xl mb-1">{m.icon}</p>
              <p className="text-xs text-gray-400 font-medium">7-day avg</p>
              <p className="text-lg font-bold text-gray-800 mt-0.5">
                {val !== null ? val.toFixed(m.key === "steps" ? 0 : 1) : "—"}
                <span className="text-xs text-gray-400 ml-0.5">{m.unit}</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Log today</h2>
          <HealthLogForm onSuccess={handleLogSaved} />
        </div>

        {/* Chart + table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">30-day trend</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
                {metrics.map(m => (
                  <button key={m.key} onClick={() => setMetric(m.key)}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeMetric === m.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>
            <HealthChart logs={logs} metric={activeMetric} />
          </div>

          {/* Log table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Recent logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    {["Date", "👟 Steps", "😴 Sleep", "💧 Water", "Mood", "⚖️ Weight"].map(h => (
                      <th key={h} className={`pb-2 font-medium ${h === "Date" ? "text-left" : "text-center"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 10).map(log => (
                    <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 text-gray-600">
                        {new Date(log.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-2.5 text-center text-gray-800">{log.steps?.toLocaleString() ?? "—"}</td>
                      <td className="py-2.5 text-center text-gray-800">{log.sleepHrs ? `${log.sleepHrs}h` : "—"}</td>
                      <td className="py-2.5 text-center text-gray-800">{log.waterL ? `${log.waterL}L` : "—"}</td>
                      <td className="py-2.5 text-center">{log.mood ? moodEmoji[log.mood] : "—"}</td>
                      <td className="py-2.5 text-center text-gray-800">{log.weight ? `${log.weight}kg` : "—"}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">No logs yet. Start tracking above!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
