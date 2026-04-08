// src/app/dashboard/page.tsx
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { TransactionType, Category } from "@prisma/client";
import Link from "next/link";

async function getDashboardData(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [transactions, healthLogs, budgets, goals, unreadAlerts] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: startOfMonth } },
      orderBy: { date: "desc" },
    }),
    prisma.healthLog.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      take: 7,
    }),
    prisma.budget.findMany({
      where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
    }),
    prisma.goal.findMany({ where: { userId }, take: 4 }),
    prisma.alert.count({ where: { userId, read: false } }),
  ]);

  const income = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((s, t) => s + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((s, t) => s + t.amount, 0);

  const avgSteps = healthLogs.length
    ? Math.round(healthLogs.reduce((s, l) => s + (l.steps ?? 0), 0) / healthLogs.length)
    : 0;

  const avgSleep = healthLogs.length
    ? (healthLogs.reduce((s, l) => s + (l.sleepHrs ?? 0), 0) / healthLogs.length).toFixed(1)
    : "0";

  const avgMood = healthLogs.length
    ? (healthLogs.reduce((s, l) => s + (l.mood ?? 0), 0) / healthLogs.length).toFixed(1)
    : "0";

  // Spending by category
  const byCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .forEach(t => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    });

  // Budget usage
  const budgetUsage = budgets.map(b => ({
    category: b.category,
    limit: b.limit,
    spent: byCategory[b.category] ?? 0,
    pct: Math.min(100, Math.round(((byCategory[b.category] ?? 0) / b.limit) * 100)),
  }));

  return {
    income, expenses, savings: income - expenses,
    avgSteps, avgSleep, avgMood,
    budgetUsage, goals, unreadAlerts,
    recentTransactions: transactions.slice(0, 5),
  };
}

function fmt(n: number) {
  return "₨" + n.toLocaleString("en-PK", { maximumFractionDigits: 0 });
}

const categoryEmoji: Record<string, string> = {
  FOOD: "🍔", TRANSPORT: "🚗", HOUSING: "🏠", HEALTH: "💊",
  ENTERTAINMENT: "🎬", SHOPPING: "🛍️", EDUCATION: "📚", SAVINGS: "💰", OTHER: "📦",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const d = await getDashboardData(user.id);

  const statCards = [
    { label: "Income this month",  value: fmt(d.income),   color: "text-emerald-600", bg: "bg-emerald-50"  },
    { label: "Expenses this month", value: fmt(d.expenses), color: "text-red-500",     bg: "bg-red-50"     },
    { label: "Net savings",         value: fmt(d.savings),  color: d.savings >= 0 ? "text-emerald-600" : "text-red-500", bg: d.savings >= 0 ? "bg-emerald-50" : "bg-red-50" },
    { label: "Avg daily steps",     value: d.avgSteps.toLocaleString(), color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Avg sleep (hrs)",     value: d.avgSleep,      color: "text-purple-600",  bg: "bg-purple-50"  },
    { label: "Avg mood",            value: `${d.avgMood}/5`, color: "text-amber-600",  bg: "bg-amber-50"   },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? "morning" : "evening"}, {user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's your FinHealth snapshot for this month</p>
        </div>
        {d.unreadAlerts > 0 && (
          <Link href="/dashboard/alerts" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
            <span>◈</span> {d.unreadAlerts} new alert{d.unreadAlerts > 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Budget usage</h2>
            <Link href="/dashboard/finance" className="text-xs text-emerald-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {d.budgetUsage.map(b => (
              <div key={b.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{categoryEmoji[b.category]} {b.category.charAt(0) + b.category.slice(1).toLowerCase()}</span>
                  <span className={b.pct >= 90 ? "text-red-600 font-medium" : "text-gray-500"}>
                    {fmt(b.spent)} / {fmt(b.limit)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${b.pct >= 90 ? "bg-red-500" : b.pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
            {d.budgetUsage.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No budgets set. <Link href="/dashboard/finance" className="text-emerald-600 hover:underline">Add one →</Link></p>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Goals</h2>
            <Link href="/dashboard/goals" className="text-xs text-emerald-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {d.goals.map(g => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 flex items-center gap-1">
                      {g.achieved && <span className="text-emerald-500">✓</span>} {g.title}
                    </span>
                    <span className="text-gray-500">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${g.achieved ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent transactions</h2>
          <Link href="/dashboard/finance" className="text-xs text-emerald-600 hover:underline">View all →</Link>
        </div>
        <div className="space-y-2">
          {d.recentTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">{categoryEmoji[t.category]}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.note ?? t.category}</p>
                  <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${t.type === TransactionType.INCOME ? "text-emerald-600" : "text-gray-800"}`}>
                {t.type === TransactionType.INCOME ? "+" : "-"}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="font-semibold text-lg">✦ Get your AI insight</h2>
        <p className="text-emerald-100 text-sm mt-1 mb-4">
          Ask AI to analyze your finance + health data together and find hidden patterns.
        </p>
        <Link
          href="/dashboard/ai"
          className="inline-block bg-white text-emerald-700 font-medium text-sm px-5 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          Open AI advisor →
        </Link>
      </div>
    </div>
  );
}
