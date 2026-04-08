"use client";
// src/components/finance/spending-chart.tsx

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface Transaction {
  type:     string;
  category: string;
  amount:   number;
  date:     string;
}

interface Props {
  transactions: Transaction[];
}

const COLORS = [
  "#059669", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

function fmt(n: number) {
  if (n >= 1000) return "₨" + (n / 1000).toFixed(0) + "k";
  return "₨" + n;
}

export function SpendingChart({ transactions: txs }: Props) {
  // Daily spending for last 14 days
  const dailyMap: Record<string, number> = {};
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
    dailyMap[key] = 0;
  }

  txs
    .filter(t => t.type === "EXPENSE")
    .forEach(t => {
      const d    = new Date(t.date);
      const key  = d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
      if (key in dailyMap) dailyMap[key] += t.amount;
    });

  const dailyData = Object.entries(dailyMap).map(([date, amount]) => ({
    date, amount,
  }));

  // Spending by category (pie)
  const categoryMap: Record<string, number> = {};
  txs
    .filter(t => t.type === "EXPENSE")
    .forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount;
    });

  const pieData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      {/* Daily bar chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Daily spending — last 14 days</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(v: number) => ["₨" + v.toLocaleString(), "Spent"]}
              contentStyle={{
                fontSize: 12, borderRadius: 8,
                border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Spending by category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => ["₨" + v.toLocaleString(), "Spent"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={v => <span style={{ fontSize: 12, color: "#6b7280" }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
