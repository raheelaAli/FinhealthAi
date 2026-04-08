"use client";
// src/components/health/health-chart.tsx

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

interface HealthLog {
  date:     string;
  steps:    number | null;
  sleepHrs: number | null;
  waterL:   number | null;
  mood:     number | null;
  weight:   number | null;
}

interface Props {
  logs:   HealthLog[];
  metric: "steps" | "sleepHrs" | "waterL" | "mood" | "weight";
}

const metaMap = {
  steps:    { label: "Steps",       color: "#3b82f6", unit: "steps" },
  sleepHrs: { label: "Sleep",       color: "#8b5cf6", unit: "hrs"   },
  waterL:   { label: "Water",       color: "#06b6d4", unit: "L"     },
  mood:     { label: "Mood",        color: "#f59e0b", unit: "/5"    },
  weight:   { label: "Weight",      color: "#ec4899", unit: "kg"    },
};

export function HealthChart({ logs, metric }: Props) {
  const meta = metaMap[metric];

  const data = [...logs]
    .reverse()
    .map(l => ({
      date:  new Date(l.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
      value: l[metric] ?? null,
    }))
    .filter(d => d.value !== null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        No data yet — start logging!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false} tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false} tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(v: number) => [`${v} ${meta.unit}`, meta.label]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={meta.color}
          strokeWidth={2}
          dot={{ r: 3, fill: meta.color }}
          activeDot={{ r: 5 }}
          connectNulls
          name={meta.label}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
