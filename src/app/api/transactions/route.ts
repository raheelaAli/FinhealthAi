// src/app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TransactionType, Category } from "@prisma/client";
import { checkBudgetAlert, checkIncomeAlert, checkFinanceGoalAlerts } from "@/lib/alert-service";

const createSchema = z.object({
  type:     z.nativeEnum(TransactionType),
  category: z.nativeEnum(Category),
  amount:   z.number().positive("Amount must be positive"),
  note:     z.string().optional(),
  date:     z.string(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as Category | null;
  const type     = searchParams.get("type") as TransactionType | null;
  const from     = searchParams.get("from");
  const to       = searchParams.get("to");

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(category && { category }),
      ...(type && { type }),
      ...(from || to ? { date: {
        ...(from && { gte: new Date(from) }),
        ...(to   && { lte: new Date(to)   }),
      }} : {}),
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ transactions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const transaction = await prisma.transaction.create({
      data: {
        userId:   session.user.id,
        type:     data.type,
        category: data.category,
        amount:   data.amount,
        note:     data.note,
        date:     new Date(data.date),
      },
    });

    // FIXED: await alerts directly — fire-and-forget IIFE gets killed on serverless
    if (data.type === TransactionType.EXPENSE) {
      await checkBudgetAlert(session.user.id, data.category);
      await checkFinanceGoalAlerts(session.user.id);
    }
    if (data.type === TransactionType.INCOME) {
      await checkIncomeAlert(session.user.id, data.amount);
    }

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Transaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
