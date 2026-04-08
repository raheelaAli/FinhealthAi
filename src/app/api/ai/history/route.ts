// src/app/api/ai/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const insights = await prisma.aiInsight.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take:    10,
    select:  { id: true, prompt: true, response: true, type: true, createdAt: true },
  });

  return NextResponse.json({ insights });
}
