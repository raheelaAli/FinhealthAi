// src/app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    premiumUsers,
    totalTransactions,
    totalHealthLogs,
    totalAiInsights,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.PREMIUM } }),
    prisma.transaction.count(),
    prisma.healthLog.count(),
    prisma.aiInsight.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take:    10,
      select:  {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { transactions: true, healthLogs: true, aiInsights: true } },
      },
    }),
  ]);

  return NextResponse.json({
    stats: { totalUsers, premiumUsers, totalTransactions, totalHealthLogs, totalAiInsights },
    recentUsers,
  });
}
