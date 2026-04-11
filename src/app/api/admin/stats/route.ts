// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now  = new Date();
  const days = 14;

  const dateRange = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const rangeStart = dateRange[0];

  const [totalUsers, totalTransactions, totalHealthLogs, totalAiInsights, totalGoals,
    usersRaw, txRaw, aiRaw, healthRaw] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.healthLog.count(),
    prisma.aiInsight.count(),
    prisma.goal.count(),
    prisma.user.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true } }),
    prisma.transaction.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true } }),
    prisma.aiInsight.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true } }),
    prisma.healthLog.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true } }),
  ]);

  function countByDay(records: { createdAt: Date }[]) {
    const map: Record<string, number> = {};
    for (const r of records) {
      const key = new Date(r.createdAt).toISOString().split("T")[0];
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }

  const userMap   = countByDay(usersRaw);
  const txMap     = countByDay(txRaw);
  const aiMap     = countByDay(aiRaw);
  const healthMap = countByDay(healthRaw);

  const chartData = dateRange.map(d => {
    const key   = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
    return {
      date: key, label,
      newUsers:     userMap[key]   ?? 0,
      transactions: txMap[key]     ?? 0,
      aiQueries:    aiMap[key]     ?? 0,
      healthLogs:   healthMap[key] ?? 0,
      totalUsage:   (txMap[key] ?? 0) + (aiMap[key] ?? 0) + (healthMap[key] ?? 0),
    };
  });

  const totalUsage  = totalTransactions + totalHealthLogs + totalAiInsights + totalGoals;
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [activeTx, activeHealth, activeAi] = await Promise.all([
    prisma.transaction.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { userId: true } }),
    prisma.healthLog.findMany({   where: { createdAt: { gte: sevenDaysAgo } }, select: { userId: true } }),
    prisma.aiInsight.findMany({   where: { createdAt: { gte: sevenDaysAgo } }, select: { userId: true } }),
  ]);
  const activeUserIds = new Set([...activeTx, ...activeHealth, ...activeAi].map(r => r.userId));

  return NextResponse.json({
    stats: { totalUsers, totalUsage, totalTransactions, totalHealthLogs, totalAiInsights, activeUsers: activeUserIds.size },
    chartData,
  });
}
