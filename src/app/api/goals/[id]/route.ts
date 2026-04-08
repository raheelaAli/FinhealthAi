// src/app/api/goals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title:       z.string().min(2).optional(),
  description: z.string().optional(),
  target:      z.number().positive().optional(),
  current:     z.number().min(0).optional(),
  unit:        z.string().optional(),
  deadline:    z.string().nullable().optional(),
  achieved:    z.boolean().optional(),
});

async function getGoal(id: string, userId: string) {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) return null;
  return goal;
}

// PATCH /api/goals/[id] — update progress or details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const goal   = await getGoal(id, session.user.id);
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...data,
        ...(data.deadline !== undefined
          ? { deadline: data.deadline ? new Date(data.deadline) : null }
          : {}),
      },
    });

    return NextResponse.json({ goal: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/goals/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const goal   = await getGoal(id, session.user.id);
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
