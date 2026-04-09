"use client";
// src/context/alerts-context.tsx
// Single source of truth for alerts — shared between AlertToast, AlertsPage, and SideNav badge
// Without this, each component creates its own SSE connection and state — they go out of sync

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
  alerts:      Alert[];
  unreadCount: number;
  toast:       Alert | null;
  markAllRead: () => Promise<void>;
  dismissToast:() => void;
  refresh:     () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts,      setAlerts]      = useState<Alert[]>([]);
  const [toast,       setToast]       = useState<Alert | null>(null);
  const lastChecked                   = useRef(new Date());

  const unreadCount = alerts.filter(a => !a.read).length;

  // Load all alerts from DB on mount
  const refresh = useCallback(async () => {
    try {
      const res  = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } catch {}
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // SSE connection — one connection for the whole app
  useEffect(() => {
    const es = new EventSource("/api/alerts/sse");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "alert") {
          const newAlert: Alert = data.alert;
          setAlerts(prev => {
            // avoid duplicates
            if (prev.find(a => a.id === newAlert.id)) return prev;
            return [newAlert, ...prev];
          });
          setToast(newAlert);
          lastChecked.current = new Date();
          setTimeout(() => setToast(null), 5000);
        }
      } catch {}
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch("/api/alerts", { method: "PATCH" });
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <AlertsContext.Provider value={{
      alerts, unreadCount, toast,
      markAllRead, dismissToast, refresh,
    }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used inside AlertsProvider");
  return ctx;
}
