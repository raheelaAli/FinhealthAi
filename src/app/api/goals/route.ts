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

const updateSchema = z.object({
  id:      z.string(),
  current: z.number().min(0).optional(),
  title:   z.string().min(2).optional(),
  target:  z.number().positive().optional(),
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

// PATCH /api/goals — update progress or title
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const goal = await prisma.goal.findUnique({ where: { id: data.id } });
    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (data.current !== undefined) {
      updates.current  = data.current;
      updates.achieved = data.current >= goal.target;
    }
    if (data.title   !== undefined) updates.title  = data.title;
    if (data.target  !== undefined) updates.target = data.target;

    const updated = await prisma.goal.update({
      where: { id: data.id },
      data:  updates,
    });

    // Fire goal achieved alert if just completed
    if (updates.achieved && !goal.achieved) {
      await prisma.alert.create({
        data: {
          userId:  session.user.id,
          type:    "goal_achieved",
          message: `🎉 Goal achieved: "${goal.title}"! Fantastic work!`,
        },
      });
    }

    return NextResponse.json({ goal: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
