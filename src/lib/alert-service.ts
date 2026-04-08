// src/lib/alert-service.ts
// All alert creation logic lives here — used by transactions, health, goals APIs
// This ensures consistent alert behavior across every module

import { prisma } from "@/lib/prisma";
import { Category, TransactionType } from "@prisma/client";

// ── Finance: check budget after any expense transaction ───────────────────────
export async function checkBudgetAlert(userId: string, category: Category) {
  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const budget = await prisma.budget.findUnique({
    where: { userId_category_month_year: { userId, category, month, year } },
  });

  if (!budget) return; // no budget set for this category — nothing to alert

  const startOfMonth = new Date(year, month - 1, 1);

  const spent = await prisma.transaction.aggregate({
    where: {
      userId,
      category,
      type: TransactionType.EXPENSE,
      date: { gte: startOfMonth },
    },
    _sum: { amount: true },
  });

  const totalSpent = spent._sum.amount ?? 0;
  const pct        = (totalSpent / budget.limit) * 100;
  const label      = category.charAt(0) + category.slice(1).toLowerCase();

  // Fire at 80% and again at 100%
  if (pct >= 80) {
    const threshold = pct >= 100 ? 100 : 80;
    const msg =
      pct >= 100
        ? `⚠️ You've exceeded your ${label} budget! Spent ₨${Math.round(totalSpent).toLocaleString()} of ₨${budget.limit.toLocaleString()}`
        : `🔔 ${Math.round(pct)}% of your ${label} budget used — ₨${Math.round(totalSpent).toLocaleString()} of ₨${budget.limit.toLocaleString()}`;

    // Avoid duplicate — check if we already sent this threshold alert this month
    const existing = await prisma.alert.findFirst({
      where: {
        userId,
        type:      "budget_warning",
        message:   { contains: label },
        createdAt: { gte: startOfMonth },
        read:      false,
      },
    });

    if (!existing) {
      await prisma.alert.create({
        data: { userId, type: "budget_warning", message: msg },
      });
    }
  }
}

// ── Finance: alert when a large income is received ───────────────────────────
export async function checkIncomeAlert(userId: string, amount: number) {
  if (amount >= 50000) {
    await prisma.alert.create({
      data: {
        userId,
        type:    "income_received",
        message: `💰 Income of ₨${amount.toLocaleString()} recorded. Great time to review your savings goals!`,
      },
    });
  }
}

// ── Health: check goal milestones after logging ───────────────────────────────
export async function checkHealthGoalAlerts(
  userId: string,
  data: {
    steps?:    number;
    sleepHrs?: number;
    waterL?:   number;
    weight?:   number;
    mood?:     number;
  }
) {
  const goals = await prisma.goal.findMany({
    where: { userId, type: "health", achieved: false },
  });

  for (const goal of goals) {
    let current: number | undefined;
    const t = goal.title.toLowerCase();

    if (t.includes("step")   && data.steps    !== undefined) current = data.steps;
    if (t.includes("sleep")  && data.sleepHrs !== undefined) current = data.sleepHrs;
    if (t.includes("water")  && data.waterL   !== undefined) current = data.waterL;
    if (t.includes("weight") && data.weight   !== undefined) current = data.weight;

    if (current === undefined) continue;

    await prisma.goal.update({ where: { id: goal.id }, data: { current } });

    if (current >= goal.target) {
      await prisma.goal.update({ where: { id: goal.id }, data: { achieved: true } });
      await createGoalAlert(userId, goal.title);
    }
  }
}

// ── Finance: check finance goals after any transaction ────────────────────────
export async function checkFinanceGoalAlerts(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId, type: "finance", achieved: false },
  });

  for (const goal of goals) {
    // Calculate current savings balance for savings goals
    if (goal.title.toLowerCase().includes("sav")) {
      const result = await prisma.transaction.aggregate({
        where: { userId, category: Category.SAVINGS, type: TransactionType.EXPENSE },
        _sum:  { amount: true },
      });
      const current = result._sum.amount ?? 0;
      await prisma.goal.update({ where: { id: goal.id }, data: { current } });

      if (current >= goal.target) {
        await prisma.goal.update({ where: { id: goal.id }, data: { achieved: true } });
        await createGoalAlert(userId, goal.title);
      }
    }
  }
}

// ── Shared: create goal achieved alert (deduped) ──────────────────────────────
async function createGoalAlert(userId: string, title: string) {
  const existing = await prisma.alert.findFirst({
    where: { userId, type: "goal_achieved", message: { contains: title } },
  });
  if (!existing) {
    await prisma.alert.create({
      data: {
        userId,
        type:    "goal_achieved",
        message: `🎉 Goal achieved: "${title}"! Fantastic work — set a new challenge!`,
      },
    });
  }
}

// ── Health: streak alerts ─────────────────────────────────────────────────────
export async function checkStreakAlert(userId: string) {
  // Count consecutive days with health logs
  const logs = await prisma.healthLog.findMany({
    where:   { userId },
    orderBy: { date: "desc" },
    take:    8,
    select:  { date: true },
  });

  if (logs.length < 3) return;

  let streak = 1;
  for (let i = 1; i < logs.length; i++) {
    const prev = new Date(logs[i - 1].date);
    const curr = new Date(logs[i].date);
    const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) streak++;
    else break;
  }

  const milestones = [3, 7];
  if (!milestones.includes(streak)) return;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await prisma.alert.findFirst({
    where: {
      userId,
      type:      "health_streak",
      createdAt: { gte: startOfDay },
    },
  });

  if (!existing) {
    await prisma.alert.create({
      data: {
        userId,
        type:    "health_streak",
        message: `🔥 ${streak}-day health logging streak! Keep the momentum going!`,
      },
    });
  }
}
