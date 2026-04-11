// src/app/admin/layout.tsx
import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = { title: "Admin Panel — FinHealth AI" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
              Admin Panel
            </span>
          </div>
          <p className="text-xs text-gray-400">FinHealth AI — Admin Dashboard</p>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
