// src/app/api/admin/cms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pageSchema = z.object({
  title:     z.string().min(2),
  slug:      z.string().min(2).regex(/^[a-z0-9-]+$/),
  content:   z.string().min(1),
  published: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const pages = await prisma.cmsPage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const data = pageSchema.parse(body);
    const existing = await prisma.cmsPage.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
    const page = await prisma.cmsPage.create({ data });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error: any) {
    if (error?.errors) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
