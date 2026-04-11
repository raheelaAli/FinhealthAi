"use client";
// src/components/admin/admin-sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/logo";

const navItems = [
  { href: "/admin",          label: "Dashboard",  icon: "◉" },
  { href: "/admin/users",    label: "Users",       icon: "👥" },
  { href: "/admin/cms",      label: "CMS Pages",   icon: "📄" },
  { href: "/admin/settings", label: "Settings",    icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 bg-emerald-950 text-white flex flex-col h-full shrink-0">
      <div className="px-5 py-5 border-b border-emerald-800">
        <Logo variant="dark" size="md" />
        <span className="mt-2 inline-block text-[10px] font-semibold tracking-widest uppercase text-emerald-400 px-2 py-0.5 bg-emerald-800/50 rounded-full">
          Admin Panel
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-emerald-600 text-white font-medium shadow-sm"
                  : "text-emerald-200 hover:bg-emerald-800 hover:text-white"
              }`}>
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-emerald-800">
        <a href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors mb-1">
          <span className="w-4 text-center">←</span>
          Back to app
        </a>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors">
          <span className="w-4 text-center">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
