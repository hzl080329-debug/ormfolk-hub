import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["superadmin", "founder"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { email, role: newRole } = await request.json();
  if (!email || !newRole) return NextResponse.json({ error: "email and role required" }, { status: 400 });
  await prisma.user.updateMany({ where: { email }, data: { role: newRole } });
  return NextResponse.json({ ok: true, email, role: newRole });
}
