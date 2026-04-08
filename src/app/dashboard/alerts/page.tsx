"use client";
// src/app/dashboard/alerts/page.tsx

import { useAlerts } from "@/context/alerts-context";

const alertIcon: Record<string, string> = {
  budget_warning: "🔔",
  goal_achieved:  "🎉",
  health_streak:  "🔥",
};

const alertColor: Record<string, string> = {
  budget_warning: "bg-amber-50 border-amber-200",
  goal_achieved:  "bg-emerald-50 border-emerald-200",
  health_streak:  "bg-blue-50 border-blue-200",
};

export default function AlertsPage() {
  const { alerts, unreadCount, markAllRead } = useAlerts();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time notifications about your budgets and goals
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No alerts yet. Add a transaction and we'll notify you when budgets are near!
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-xl border ${
                alertColor[alert.type] ?? "bg-gray-50 border-gray-200"
              } ${!alert.read ? "ring-1 ring-offset-1 ring-emerald-200" : ""}`}
            >
              <span className="text-2xl shrink-0">{alertIcon[alert.type] ?? "◈"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {alert.type.replace(/_/g, " ")}
                  </p>
                  {!alert.read && (
                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(alert.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
