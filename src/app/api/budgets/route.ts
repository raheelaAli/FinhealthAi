// src/app/api/budgets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Category } from "@prisma/client";

const budgetSchema = z.object({
  category: z.nativeEnum(Category),
  limit:    z.number().positive("Limit must be positive"),
  month:    z.number().min(1).max(12),
  year:     z.number().min(2024),
});

// GET /api/budgets — current month budgets with spending
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id, month, year },
  });

  return NextResponse.json({ budgets });
}

// POST /api/budgets — create or update a budget
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = budgetSchema.parse(body);

    // Upsert — update if exists, create if not
    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId:   session.user.id,
          category: data.category,
          month:    data.month,
          year:     data.year,
        },
      },
      update: { limit: data.limit },
      create: {
        userId:   session.user.id,
        category: data.category,
        limit:    data.limit,
        month:    data.month,
        year:     data.year,
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
