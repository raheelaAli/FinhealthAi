// src/lib/admin-auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session.user;
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session.user;
}
