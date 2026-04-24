"use client";
// src/components/admin/admin-sidebar.tsx
// Admin sidebar — same brand theme as user panel (brand-600/teal), dark variant
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/logo";

const navItems = [
  {
    href: "/admin", label: "Dashboard",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
  },
  {
    href: "/admin/users", label: "Users",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
  },
  {
    href: "/admin/cms", label: "CMS Pages",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
  },
  {
    href: "/admin/settings", label: "Settings",
    icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 admin-sidebar flex flex-col h-full shrink-0"
      role="navigation"
      aria-label="Admin navigation"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-brand-800/50">
        <Logo variant="dark" size="md" />
        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-brand-600/30 border border-brand-500/30 rounded-full px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-soft" />
          <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                active
                  ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold shadow-brand"
                  : "text-brand-200/80 hover:bg-brand-800/40 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand-300 rounded-r-full" aria-hidden="true" />
              )}
              <span className={active ? "text-white" : "text-brand-400 group-hover:text-brand-200"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-brand-800/50 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-300/80 hover:bg-brand-800/40 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-400" aria-hidden="true">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to app
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-300/80 hover:bg-red-900/30 hover:text-red-300 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
