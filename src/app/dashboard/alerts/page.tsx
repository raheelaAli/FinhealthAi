"use client";
// src/app/dashboard/alerts/page.tsx

import { useAlerts } from "@/context/alerts-context";

const alertIcon: Record<string, string> = {
  budget_warning:  "🔔",
  goal_achieved:   "🎉",
  health_streak:   "🔥",
  income_received: "💰",
};

const alertBg: Record<string, string> = {
  budget_warning:  "bg-amber-50 border-amber-200",
  goal_achieved:   "bg-emerald-50 border-emerald-200",
  health_streak:   "bg-blue-50 border-blue-200",
  income_received: "bg-green-50 border-green-200",
};

export default function AlertsPage() {
  const { alerts, unreadCount, markAllRead } = useAlerts();

  const grouped = {
    unread: alerts.filter(a => !a.read),
    read:   alerts.filter(a => a.read),
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time notifications about your budgets, goals and streaks</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-sm text-emerald-600 hover:text-emerald-800 font-medium border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500 text-sm">No alerts yet.</p>
          <p className="text-gray-400 text-xs mt-1">Add transactions or log health data and we'll notify you!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unread */}
          {grouped.unread.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">New — {grouped.unread.length}</p>
              <div className="space-y-2">
                {grouped.unread.map(alert => (
                  <div key={alert.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${alertBg[alert.type] ?? "bg-gray-50 border-gray-200"} ring-1 ring-emerald-200`}>
                    <span className="text-2xl shrink-0">{alertIcon[alert.type] ?? "◈"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 capitalize">{alert.type.replace(/_/g, " ")}</p>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read */}
          {grouped.read.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Earlier</p>
              <div className="space-y-2">
                {grouped.read.map(alert => (
                  <div key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white opacity-70">
                    <span className="text-xl shrink-0">{alertIcon[alert.type] ?? "◈"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 capitalize">{alert.type.replace(/_/g, " ")}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
