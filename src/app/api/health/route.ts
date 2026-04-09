// src/app/api/health/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkHealthGoalAlerts, checkStreakAlert } from "@/lib/alert-service";

const logSchema = z.object({
  date:     z.string(),
  steps:    z.number().int().min(0).optional(),
  sleepHrs: z.number().min(0).max(24).optional(),
  waterL:   z.number().min(0).optional(),
  mood:     z.number().int().min(1).max(5).optional(),
  weight:   z.number().min(0).optional(),
  notes:    z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30");
  const from = new Date();
  from.setDate(from.getDate() - days);

  const logs = await prisma.healthLog.findMany({
    where:   { userId: session.user.id, date: { gte: from } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = logSchema.parse(body);

    const date      = new Date(data.date);
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateEnd   = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

    const existing = await prisma.healthLog.findFirst({
      where: { userId: session.user.id, date: { gte: dateStart, lt: dateEnd } },
    });

    const log = existing
      ? await prisma.healthLog.update({ where: { id: existing.id }, data: { ...data, date: new Date(data.date) } })
      : await prisma.healthLog.create({ data: { userId: session.user.id, ...data, date: new Date(data.date) } });

    // FIXED: await alerts directly
    await checkHealthGoalAlerts(session.user.id, data);
    await checkStreakAlert(session.user.id);

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Health log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
