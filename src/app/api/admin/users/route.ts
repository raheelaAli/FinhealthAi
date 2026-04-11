// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { transactions: true, healthLogs: true, aiInsights: true, goals: true } },
    },
  });

  const usersWithUsage = users.map(u => ({
    ...u,
    totalUsage: u._count.transactions + u._count.healthLogs + u._count.aiInsights + u._count.goals,
  }));

  return NextResponse.json({ users: usersWithUsage });
}
