"use client";
// src/components/ui/providers.tsx

import { SessionProvider } from "next-auth/react";
import { AlertsProvider }  from "@/context/alerts-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AlertsProvider>
        {children}
      </AlertsProvider>
    </SessionProvider>
  );
}
