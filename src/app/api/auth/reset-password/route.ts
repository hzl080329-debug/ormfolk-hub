import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  const { email, code, password } = await request.json();
  if (!email || !code || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const record = await prisma.verificationCode.findFirst({
    where: { email, code, type: "reset_password", used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
  await prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } });
  return NextResponse.json({ success: true });
}
