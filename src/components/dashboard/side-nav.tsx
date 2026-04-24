"use client";
// src/components/dashboard/side-nav.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAlerts } from "@/context/alerts-context";
import { Logo } from "@/components/logo";

interface Props {
  user: { name?: string | null; email?: string | null; role: string };
}

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/finance",
    label: "Finance",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/health",
    label: "Health",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/ai",
    label: "AI Insights",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/goals",
    label: "Goals",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/dashboard/alerts",
    label: "Alerts",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    ),
    badge: true,
  },
];

export function SideNav({ user }: Props) {
  const pathname        = usePathname();
  const { unreadCount } = useAlerts();

  return (
    <aside
      className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shrink-0 shadow-sm"
      role="navigation"
      aria-label="Dashboard navigation"
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <Logo size="md" />
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
          <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
            {user.role.toLowerCase()} plan
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href;
          const badge  = item.badge ? unreadCount : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                active
                  ? "sidebar-active nav-active"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={active ? "text-brand-600" : "text-gray-400 group-hover:text-gray-600"}>
                  {item.icon}
                </span>
                <span className={active ? "font-semibold" : ""}>{item.label}</span>
              </span>
              {badge > 0 && (
                <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        {user.role === "ADMIN" && (
          <div className="pt-3 mt-3 border-t border-gray-100">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-700 hover:bg-brand-50 transition-colors font-semibold"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase() ?? "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name ?? "User"}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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
