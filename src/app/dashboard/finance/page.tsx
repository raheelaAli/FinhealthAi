"use client";
// src/app/dashboard/finance/page.tsx

import { useEffect, useState, useCallback } from "react";
import { TransactionType } from "@prisma/client";
import { TransactionForm } from "@/components/finance/transaction-form";
import { TransactionList } from "@/components/finance/transaction-list";
import { SpendingChart }   from "@/components/finance/spending-chart";
import { BudgetManager }   from "@/components/finance/budget-manager";
import { useAlerts }       from "@/context/alerts-context";

interface Transaction {
  id: string; type: string; category: string;
  amount: number; note: string | null; date: string;
}
interface BudgetUsage {
  category: string; limit: number; spent: number; pct: number;
}

function fmt(n: number) { return "₨" + n.toLocaleString("en-PK", { maximumFractionDigits: 0 }); }

export default function FinancePage() {
  const { refresh: refreshAlerts } = useAlerts();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetUsage,  setBudgetUsage]  = useState<BudgetUsage[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState<"all" | "income" | "expense">("all");

  const loadData = useCallback(async () => {
    const [txRes, bRes] = await Promise.all([fetch("/api/transactions"), fetch("/api/budgets")]);
    const txData = await txRes.json();
    const bData  = await bRes.json();
    const txs: Transaction[] = txData.transactions ?? [];
    setTransactions(txs);

    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const spent: Record<string, number> = {};
    txs.filter(t => t.type === "EXPENSE" && new Date(t.date) >= start)
       .forEach(t => { spent[t.category] = (spent[t.category] ?? 0) + t.amount; });

    const usage: BudgetUsage[] = (bData.budgets ?? []).map((b: any) => ({
      category: b.category, limit: b.limit,
      spent:    spent[b.category] ?? 0,
      pct:      Math.min(100, Math.round(((spent[b.category] ?? 0) / b.limit) * 100)),
    }));
    setBudgetUsage(usage);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleTransactionAdded() {
    await loadData();
    await refreshAlerts(); // refresh alerts after add — picks up any budget alerts
  }

  async function handleDelete(id: string) {
    setTransactions(prev => prev.filter(t => t.id !== id));
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    await loadData(); // recalculate budget bars after delete
  }

  const income   = transactions.filter(t => t.type === "INCOME" ).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const filtered = tab === "all" ? transactions : transactions.filter(t => t.type === tab.toUpperCase());

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <p className="text-gray-500 text-sm mt-1">Track spending, set budgets, stay in control</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Income",    value: fmt(income),           color: "text-emerald-600" },
          { label: "Expenses",  value: fmt(expenses),         color: "text-red-500"     },
          { label: "Net savings", value: fmt(income-expenses), color: income-expenses >= 0 ? "text-emerald-600" : "text-red-500" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Add transaction</h2>
            <TransactionForm onSuccess={handleTransactionAdded} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Monthly budgets</h2>
            <BudgetManager budgetUsage={budgetUsage} onUpdate={loadData} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Spending overview</h2>
            <SpendingChart transactions={transactions} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Transactions</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(["all", "income", "expense"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                      tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <TransactionList transactions={filtered} onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </div>
  );
}
