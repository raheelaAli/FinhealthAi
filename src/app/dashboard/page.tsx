// src/app/dashboard/page.tsx
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Overview",
  description: "Your FinHealth AI dashboard — finance and health at a glance.",
};

async function getDashboardData(userId: string) {
  const now          = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [transactions, healthLogs, budgets, goals, unreadAlerts] = await Promise.all([
    prisma.transaction.findMany({ where: { userId, date: { gte: startOfMonth } }, orderBy: { date: "desc" } }),
    prisma.healthLog.findMany({ where: { userId, date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" }, take: 7 }),
    prisma.budget.findMany({ where: { userId, month: now.getMonth() + 1, year: now.getFullYear() } }),
    prisma.goal.findMany({ where: { userId }, take: 4, orderBy: { createdAt: "desc" } }),
    prisma.alert.count({ where: { userId, read: false } }),
  ]);

  const income   = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s,t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s,t) => s + t.amount, 0);
  const avgSteps = healthLogs.length ? Math.round(healthLogs.reduce((s,l) => s + (l.steps ?? 0), 0) / healthLogs.length) : 0;
  const avgSleep = healthLogs.length ? (healthLogs.reduce((s,l) => s + (l.sleepHrs ?? 0), 0) / healthLogs.length).toFixed(1) : "0";
  const avgMood  = healthLogs.length ? (healthLogs.reduce((s,l) => s + (l.mood ?? 0), 0) / healthLogs.length).toFixed(1) : "0";

  const byCategory: Record<string,number> = {};
  transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  });
  const budgetUsage = budgets.map(b => ({
    category: b.category, limit: b.limit,
    spent: byCategory[b.category] ?? 0,
    pct: Math.min(100, Math.round(((byCategory[b.category] ?? 0) / b.limit) * 100)),
  }));

  return { income, expenses, savings: income - expenses, avgSteps, avgSleep, avgMood, budgetUsage, goals, unreadAlerts, recentTransactions: transactions.slice(0, 5) };
}

function fmt(n: number) { return "₨" + n.toLocaleString("en-PK", { maximumFractionDigits: 0 }); }

const categoryEmoji: Record<string,string> = {
  FOOD:"🍔", TRANSPORT:"🚗", HOUSING:"🏠", HEALTH:"💊",
  ENTERTAINMENT:"🎬", SHOPPING:"🛍️", EDUCATION:"📚", SAVINGS:"💰", OTHER:"📦",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const d    = await getDashboardData(user.id);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { label: "Income this month",   value: fmt(d.income),   color: "text-brand-700",  bg: "bg-brand-50  border-brand-200",  icon: "↑", iconBg: "bg-brand-100 text-brand-600" },
    { label: "Expenses this month", value: fmt(d.expenses), color: "text-red-600",    bg: "bg-red-50    border-red-200",    icon: "↓", iconBg: "bg-red-100 text-red-500" },
    { label: "Net savings",         value: fmt(d.savings),  color: d.savings >= 0 ? "text-brand-700" : "text-red-600", bg: d.savings >= 0 ? "bg-brand-50 border-brand-200" : "bg-red-50 border-red-200", icon: "₨", iconBg: d.savings >= 0 ? "bg-brand-100 text-brand-600" : "bg-red-100 text-red-500" },
    { label: "Avg daily steps",     value: d.avgSteps.toLocaleString(), color: "text-blue-700",   bg: "bg-blue-50   border-blue-200",   icon: "👟", iconBg: "bg-blue-100 text-blue-600" },
    { label: "Avg sleep (hrs)",     value: d.avgSleep,      color: "text-violet-700", bg: "bg-violet-50 border-violet-200", icon: "😴", iconBg: "bg-violet-100 text-violet-600" },
    { label: "Avg mood score",      value: `${d.avgMood}/5`,color: "text-amber-700",  bg: "bg-amber-50  border-amber-200",  icon: "😊", iconBg: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's your FinHealth snapshot for this month</p>
        </div>
        {d.unreadAlerts > 0 && (
          <Link href="/dashboard/alerts"
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors shrink-0">
            <span aria-hidden="true">🔔</span>
            <span>{d.unreadAlerts} new alert{d.unreadAlerts > 1 ? "s" : ""}</span>
          </Link>
        )}
      </header>

      {/* Stat cards */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(c => (
            <div key={c.label} className={`rounded-2xl border p-5 stat-card ${c.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.label}</p>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${c.iconBg}`}>{c.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Budget overview */}
        {d.budgetUsage.length > 0 && (
          <section aria-labelledby="budget-heading">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <header className="flex items-center justify-between mb-5">
                <h2 id="budget-heading" className="font-semibold text-gray-900">Budget overview</h2>
                <Link href="/dashboard/finance" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">Manage →</Link>
              </header>
              <ul className="space-y-4" role="list">
                {d.budgetUsage.map(b => (
                  <li key={b.category}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{categoryEmoji[b.category]} {b.category}</span>
                      <span className={`text-xs font-semibold ${b.pct >= 100 ? "text-red-600" : b.pct >= 80 ? "text-amber-600" : "text-gray-500"}`}>
                        {fmt(b.spent)} / {fmt(b.limit)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={b.pct} aria-valuemin={0} aria-valuemax={100}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${b.pct >= 100 ? "bg-red-500" : b.pct >= 80 ? "bg-amber-500" : "progress-bar"}`}
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Recent transactions */}
        {d.recentTransactions.length > 0 && (
          <section aria-labelledby="recent-tx-heading">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <header className="flex items-center justify-between mb-5">
                <h2 id="recent-tx-heading" className="font-semibold text-gray-900">Recent transactions</h2>
                <Link href="/dashboard/finance" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">See all →</Link>
              </header>
              <ul className="space-y-3" role="list">
                {d.recentTransactions.map(t => (
                  <li key={t.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg" aria-hidden="true">{categoryEmoji[t.category] ?? "📦"}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-tight">{t.description || t.category}</p>
                        <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString("en-PK", { day:"numeric", month:"short" })}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === TransactionType.INCOME ? "text-brand-600" : "text-red-500"}`}>
                      {t.type === TransactionType.INCOME ? "+" : "-"}{fmt(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* Goals */}
      {d.goals.length > 0 && (
        <section aria-labelledby="goals-heading">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <header className="flex items-center justify-between mb-5">
              <h2 id="goals-heading" className="font-semibold text-gray-900">Active goals</h2>
              <Link href="/dashboard/goals" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">All goals →</Link>
            </header>
            <div className="grid sm:grid-cols-2 gap-3">
              {d.goals.map(g => {
                const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
                return (
                  <div key={g.id} className="p-4 bg-brand-50/50 border border-brand-100 rounded-xl">
                    <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{g.title}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{g.current.toLocaleString()} / {g.target.toLocaleString()}</span>
                      <span className="font-semibold text-brand-600">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <div className="progress-bar h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* AI CTA */}
      <section aria-labelledby="ai-cta-heading">
        <Link href="/dashboard/ai" className="block group">
          <div className="bg-gradient-to-r from-brand-600 to-teal-600 rounded-2xl p-6 flex items-center justify-between transition-opacity hover:opacity-95">
            <div>
              <h2 id="ai-cta-heading" className="font-bold text-white text-lg">Ask your AI advisor</h2>
              <p className="text-brand-100 text-sm mt-0.5">Get personalized insights from your combined data</p>
            </div>
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
              <svg viewBox="0 0 20 20" fill="white" className="w-5 h-5" aria-hidden="true">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
