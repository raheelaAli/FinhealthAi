// src/app/dashboard/layout.tsx
import { requireAuth } from "@/lib/auth-helpers";
import { SideNav } from "@/components/dashboard/side-nav";
import { AlertToast } from "@/components/ui/alert-toast";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav user={user} />
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
      {/* Fixed top-center toast — rendered outside main so it overlays everything */}
      <AlertToast />
    </div>
  );
}
