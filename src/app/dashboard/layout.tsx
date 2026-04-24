// src/app/dashboard/layout.tsx
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import { SideNav } from "@/components/dashboard/side-nav";
import { AlertToast } from "@/components/ui/alert-toast";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s — FinHealth AI" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="flex h-screen bg-gray-50/80">
      <SideNav user={user} />
      <main className="flex-1 overflow-auto focus:outline-none" id="main-content" tabIndex={-1}>
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm z-50">
          Skip to main content
        </a>
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
      <AlertToast />
    </div>
  );
}
