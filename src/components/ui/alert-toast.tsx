"use client";
// src/components/ui/alert-toast.tsx — Fixed: TOP-CENTER, slide-down animation

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
    if (toast) { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }
    else setVisible(false);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div className={`pointer-events-auto transition-all duration-300 ease-out w-full max-w-sm ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}>
        <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl border shadow-xl ${
          alertBg[toast.type] ?? "border-gray-200 bg-white"
        }`}>
          <span className="text-xl shrink-0">{alertIcon[toast.type] ?? "◈"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {toast.type.replace(/_/g, " ")}
            </p>
            <p className="text-sm text-gray-700 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={dismissToast} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
      </div>
    </div>
  );
}
