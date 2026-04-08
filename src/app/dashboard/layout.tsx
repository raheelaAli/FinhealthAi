// src/app/dashboard/layout.tsx
import { requireAuth } from "@/lib/auth-helpers";
import { SideNav } from "@/components/dashboard/side-nav";
import { AlertToast } from "@/components/ui/alert-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav user={user} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
      {/* Real-time alert toast — sits above everything */}
      <AlertToast />
    </div>
  );
}
