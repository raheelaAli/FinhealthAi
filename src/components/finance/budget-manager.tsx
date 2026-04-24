"use client";
// src/components/finance/budget-manager.tsx

import { useState } from "react";
import { Category } from "@prisma/client";

const CATEGORIES = [
  { value: Category.FOOD,          label: "🍔 Food"          },
  { value: Category.TRANSPORT,     label: "🚗 Transport"     },
  { value: Category.HOUSING,       label: "🏠 Housing"       },
  { value: Category.HEALTH,        label: "💊 Health"        },
  { value: Category.ENTERTAINMENT, label: "🎬 Entertainment" },
  { value: Category.SHOPPING,      label: "🛍️ Shopping"     },
  { value: Category.EDUCATION,     label: "📚 Education"     },
  { value: Category.SAVINGS,       label: "💰 Savings"       },
];

interface BudgetUsage {
  category: string;
  limit:    number;
  spent:    number;
  pct:      number;
}

interface Props {
  budgetUsage: BudgetUsage[];
  onUpdate:    () => void;
}

function fmt(n: number) {
  return "₨" + n.toLocaleString("en-PK", { maximumFractionDigits: 0 });
}

export function BudgetManager({ budgetUsage, onUpdate }: Props) {
  const [showForm, setShowForm]   = useState(false);
  const [category, setCategory]   = useState<Category>(Category.FOOD);
  const [limit, setLimit]         = useState("");
  const [loading, setLoading]     = useState(false);

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/budgets", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ category, limit: parseFloat(limit), month, year }),
    });
    setLoading(false);
    setShowForm(false);
    setLimit("");
    onUpdate();
  }

  return (
    <div className="space-y-4">
      {/* Budget bars */}
      {budgetUsage.map(b => (
        <div key={b.category}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-700 font-medium">
              {CATEGORIES.find(c => c.value === b.category)?.label ?? b.category}
            </span>
            <span className={`font-medium ${
              b.pct >= 100 ? "text-red-600" :
              b.pct >= 80  ? "text-amber-600" : "text-gray-500"
            }`}>
              {fmt(b.spent)} / {fmt(b.limit)}
              <span className="ml-2 text-xs">({b.pct}%)</span>
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                b.pct >= 100 ? "bg-red-500" :
                b.pct >= 80  ? "bg-amber-500" : "bg-brand-500"
              }`}
              style={{ width: `${Math.min(b.pct, 100)}%` }}
            />
          </div>
        </div>
      ))}

      {budgetUsage.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-4">
          No budgets set yet. Add one below.
        </p>
      )}

      {/* Add budget form */}
      {showForm ? (
        <form onSubmit={handleSave} className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <p className="text-sm font-medium text-gray-700">Set monthly budget</p>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={limit}
            onChange={e => setLimit(e.target.value)}
            required
            placeholder="Monthly limit (₨)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-600 text-white text-sm py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Save budget"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mt-2 py-2 border-2 border-dashed border-gray-200 text-gray-400 text-sm rounded-xl hover:border-emerald-400 hover:text-brand-600 transition-colors"
        >
          + Set a budget
        </button>
      )}
    </div>
  );
}
