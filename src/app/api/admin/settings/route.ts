// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({ contactEmail: z.string().email() });

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let settings = await prisma.adminSettings.findFirst();
  if (!settings) {
    settings = await prisma.adminSettings.create({ data: { contactEmail: admin.email ?? "" } });
  }
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);
    let settings = await prisma.adminSettings.findFirst();
    settings = settings
      ? await prisma.adminSettings.update({ where: { id: settings.id }, data })
      : await prisma.adminSettings.create({ data });
    return NextResponse.json({ settings });
  } catch (error: any) {
    if (error?.errors) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
