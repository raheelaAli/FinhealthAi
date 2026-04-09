"use client";
// src/components/finance/transaction-list.tsx

import { useState } from "react";

interface Transaction {
  id: string; type: string; category: string;
  amount: number; note: string | null; date: string;
}

const categoryEmoji: Record<string, string> = {
  FOOD: "🍔", TRANSPORT: "🚗", HOUSING: "🏠", HEALTH: "💊",
  ENTERTAINMENT: "🎬", SHOPPING: "🛍️", EDUCATION: "📚", SAVINGS: "💰", OTHER: "📦",
};

function fmt(n: number) { return "₨" + n.toLocaleString("en-PK", { maximumFractionDigits: 0 }); }

interface Props {
  transactions: Transaction[];
  onDelete:     (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No transactions yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {transactions.map(t => (
        <div key={t.id}
          className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 group transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xl">{categoryEmoji[t.category] ?? "📦"}</span>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {t.note ?? t.category.charAt(0) + t.category.slice(1).toLowerCase()}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(t.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                {" · "}{t.category.charAt(0) + t.category.slice(1).toLowerCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold ${t.type === "INCOME" ? "text-emerald-600" : "text-gray-800"}`}>
              {t.type === "INCOME" ? "+" : "−"}{fmt(t.amount)}
            </span>
            <button
              onClick={() => handleDelete(t.id)}
              disabled={deletingId === t.id}
              className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-2 py-1 rounded transition-all disabled:opacity-50">
              {deletingId === t.id ? "..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
