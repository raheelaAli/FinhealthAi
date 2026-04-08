"use client";
// src/components/dashboard/side-nav.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAlerts } from "@/context/alerts-context";

interface Props {
  user: { name?: string | null; email?: string | null; role: string };
}

export function SideNav({ user }: Props) {
  const pathname     = usePathname();
  const { unreadCount } = useAlerts();

  const navItems = [
    { href: "/dashboard",           label: "Overview",    icon: "◉",  badge: 0           },
    { href: "/dashboard/finance",   label: "Finance",     icon: "₨",  badge: 0           },
    { href: "/dashboard/health",    label: "Health",      icon: "♥",  badge: 0           },
    { href: "/dashboard/ai",        label: "AI Insights", icon: "✦",  badge: 0           },
    { href: "/dashboard/goals",     label: "Goals",       icon: "◎",  badge: 0           },
    { href: "/dashboard/alerts",    label: "Alerts",      icon: "◈",  badge: unreadCount },
  ];

  const adminItems = [
    { href: "/dashboard/admin", label: "Admin", icon: "⚙" },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">FinHealth AI</p>
            <p className="text-xs text-emerald-600 capitalize">{user.role.toLowerCase()} plan</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className="bg-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {user.role === "ADMIN" && (
          <div className="pt-2 mt-2 border-t border-gray-200">
            {adminItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-red-50 text-red-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-emerald-700 text-xs font-semibold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name ?? "User"}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span className="w-4 text-center">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
