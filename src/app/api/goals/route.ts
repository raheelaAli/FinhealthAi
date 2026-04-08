// src/app/api/goals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const goalSchema = z.object({
  title:       z.string().min(2),
  description: z.string().optional(),
  type:        z.enum(["health", "finance"]),
  target:      z.number().positive(),
  unit:        z.string().min(1),
  deadline:    z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ goals });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = goalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        userId:      session.user.id,
        title:       data.title,
        description: data.description,
        type:        data.type,
        target:      data.target,
        unit:        data.unit,
        deadline:    data.deadline ? new Date(data.deadline) : null,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
