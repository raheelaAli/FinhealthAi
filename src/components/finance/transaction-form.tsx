"use client";
// src/components/finance/transaction-form.tsx

import { useState } from "react";
import { TransactionType, Category } from "@prisma/client";

const CATEGORIES = [
  { value: Category.FOOD,          label: "🍔 Food"          },
  { value: Category.TRANSPORT,     label: "🚗 Transport"     },
  { value: Category.HOUSING,       label: "🏠 Housing"       },
  { value: Category.HEALTH,        label: "💊 Health"        },
  { value: Category.ENTERTAINMENT, label: "🎬 Entertainment" },
  { value: Category.SHOPPING,      label: "🛍️ Shopping"     },
  { value: Category.EDUCATION,     label: "📚 Education"     },
  { value: Category.SAVINGS,       label: "💰 Savings"       },
  { value: Category.OTHER,         label: "📦 Other"         },
];

interface Props {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: Props) {
  const [form, setForm] = useState({
    type:     TransactionType.EXPENSE,
    category: Category.FOOD,
    amount:   "",
    note:     "",
    date:     new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/transactions", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    // Reset form
    setForm(f => ({ ...f, amount: "", note: "" }));
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Type toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        {[TransactionType.EXPENSE, TransactionType.INCOME].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setForm(f => ({ ...f, type: t }))}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              form.type === t
                ? t === TransactionType.EXPENSE
                  ? "bg-red-500 text-white"
                  : "bg-brand-500 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t === TransactionType.EXPENSE ? "− Expense" : "+ Income"}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (₨)
        </label>
        <input
          type="number"
          min="1"
          step="any"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          required
          placeholder="0"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={form.note}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          placeholder="e.g. Grocery run, Petrol..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        {loading ? "Saving..." : "Add transaction"}
      </button>
    </form>
  );
}
