// src/app/api/admin/cms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title:     z.string().min(2).optional(),
  slug:      z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  content:   z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { id } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    if (data.slug) {
      const existing = await prisma.cmsPage.findFirst({ where: { slug: data.slug, NOT: { id } } });
      if (existing) return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
    }
    const page = await prisma.cmsPage.update({ where: { id }, data });
    return NextResponse.json({ page });
  } catch (error: any) {
    if (error?.errors) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.cmsPage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
