// src/app/admin/layout.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: { default: "Admin Dashboard", template: "%s — FinHealth Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 text-xs text-gray-400" aria-label="Breadcrumb">
              <span>Admin</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse-soft" aria-hidden="true" />
              Admin Panel
            </span>
          </div>
        </header>

        <main
          className="flex-1 overflow-auto p-8"
          id="admin-main"
          role="main"
          aria-label="Admin panel content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
