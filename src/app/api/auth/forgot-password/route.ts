import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true }); // Don't reveal if email exists

  const code = crypto.randomInt(100000, 999999).toString();
  await prisma.verificationCode.create({
    data: { email, code, type: "reset_password", expiresAt: new Date(Date.now() + 600000) },
  });
  console.log(`[DEV] Reset code for ${email}: ${code}`);
  return NextResponse.json({ success: true });
}
