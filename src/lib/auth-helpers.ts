// src/lib/auth-helpers.ts
// Server-side helpers for protecting routes and checking roles

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

// Use in Server Components / Route Handlers to get current user
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

// Redirect to login if not authenticated
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

// Redirect if not ADMIN
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN) redirect("/dashboard");
  return user;
}

// Check AI query limit: PREMIUM users = unlimited, USER = 3/month
export async function checkAiLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const user = await import("@/lib/prisma").then(m =>
    m.prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  );

  if (!user) return { allowed: false, remaining: 0 };
  if (user.role === Role.PREMIUM || user.role === Role.ADMIN) {
    return { allowed: true, remaining: 999 };
  }

  // Count AI insights this month for free users
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await import("@/lib/prisma").then(m =>
    m.prisma.aiInsight.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    })
  );

  const MONTHLY_LIMIT = 3;
  return {
    allowed: count < MONTHLY_LIMIT,
    remaining: Math.max(0, MONTHLY_LIMIT - count),
  };
}
