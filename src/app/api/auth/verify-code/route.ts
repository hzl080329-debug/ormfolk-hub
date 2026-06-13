import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { email, code, type } = await request.json();
  if (!email || !code) return NextResponse.json({ error: "Email and code required" }, { status: 400 });

  const record = await prisma.verificationCode.findFirst({
    where: { email, code, type: type || "register", used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

  await prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } });
  return NextResponse.json({ success: true });
}
