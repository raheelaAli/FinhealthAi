"use client";
// src/components/ui/alert-toast.tsx
// Fixed: positioned top-center, visible over everything

import { useEffect, useState } from "react";
import { useAlerts } from "@/context/alerts-context";

const alertIcon: Record<string, string> = {
  budget_warning:  "🔔",
  goal_achieved:   "🎉",
  health_streak:   "🔥",
  income_received: "💰",
};

const alertBg: Record<string, string> = {
  budget_warning:  "border-amber-200 bg-amber-50",
  goal_achieved:   "border-emerald-200 bg-emerald-50",
  health_streak:   "border-blue-200 bg-blue-50",
  income_received: "border-green-200 bg-green-50",
};

export function AlertToast() {
  const { toast, dismissToast } = useAlerts();
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    // Fixed top-center position
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 w-full max-w-sm px-4 ${
      visible ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4"
    }`}>
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${
        alertBg[toast.type] ?? "bg-white border-gray-200"
      }`}>
        <span className="text-xl shrink-0 mt-0.5">{alertIcon[toast.type] ?? "◈"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 capitalize">
            {toast.type.replace(/_/g, " ")}
          </p>
          <p className="text-sm text-gray-700 mt-0.5 leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          className="text-gray-400 hover:text-gray-700 text-xl leading-none shrink-0 mt-0.5 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}
