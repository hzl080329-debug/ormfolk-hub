import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  const { email, type } = await request.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Rate limit: 60s per email
  const recent = await prisma.verificationCode.findFirst({
    where: { email, createdAt: { gt: new Date(Date.now() - 60000) } },
  });
  if (recent) return NextResponse.json({ error: "Please wait 60 seconds before requesting a new code" }, { status: 429 });

  const code = crypto.randomInt(100000, 999999).toString();
  await prisma.verificationCode.create({
    data: { email, code, type: type || "register", expiresAt: new Date(Date.now() + 600000) },
  });

  // In dev mode, log the code
  console.log(`[DEV] Verification code for ${email}: ${code}`);

  return NextResponse.json({ success: true, message: "Code sent. Check console for dev mode." });
}
