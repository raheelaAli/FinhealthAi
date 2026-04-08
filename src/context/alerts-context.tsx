"use client";
// src/context/alerts-context.tsx

import {
  createContext, useContext, useEffect,
  useState, useCallback, useRef, ReactNode,
} from "react";

export interface Alert {
  id:        string;
  type:      string;
  message:   string;
  read:      boolean;
  createdAt: string;
}

interface AlertsContextValue {
  alerts:       Alert[];
  unreadCount:  number;
  toast:        Alert | null;
  markAllRead:  () => Promise<void>;
  dismissToast: () => void;
  refresh:      () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [toast,  setToast]  = useState<Alert | null>(null);
  const knownIds            = useRef<Set<string>>(new Set());

  const unreadCount = alerts.filter(a => !a.read).length;

  const refresh = useCallback(async () => {
    try {
      const res  = await fetch("/api/alerts");
      const data = await res.json();
      const fresh: Alert[] = data.alerts ?? [];

      // Find truly new alerts (not seen before) and show as toast
      const newOnes = fresh.filter(a => !knownIds.current.has(a.id) && !a.read);
      fresh.forEach(a => knownIds.current.add(a.id));

      setAlerts(fresh);

      if (newOnes.length > 0) {
        // Show each new alert as toast with stagger
        newOnes.forEach((alert, i) => {
          setTimeout(() => {
            setToast(alert);
            setTimeout(() => setToast(null), 5000);
          }, i * 600);
        });
      }
    } catch {}
  }, []);

  // Initial load — mark existing as known (don't toast on load)
  useEffect(() => {
    fetch("/api/alerts")
      .then(r => r.json())
      .then(data => {
        const existing: Alert[] = data.alerts ?? [];
        existing.forEach(a => knownIds.current.add(a.id));
        setAlerts(existing);
      })
      .catch(() => {});
  }, []);

  // SSE for real-time — when alert arrives via SSE, refresh after short delay
  useEffect(() => {
    const es = new EventSource("/api/alerts/sse");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "alert") {
          // Small delay ensures DB write is fully committed before we read
          setTimeout(() => refresh(), 300);
        }
      } catch {}
    };

    es.onerror = () => { es.close(); };
    return () => es.close();
  }, [refresh]);

  // Also poll every 8s as fallback (catches finance alerts that fire async)
  useEffect(() => {
    const id = setInterval(() => refresh(), 8000);
    return () => clearInterval(id);
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    await fetch("/api/alerts", { method: "PATCH" });
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <AlertsContext.Provider value={{ alerts, unreadCount, toast, markAllRead, dismissToast, refresh }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used inside AlertsProvider");
  return ctx;
}
