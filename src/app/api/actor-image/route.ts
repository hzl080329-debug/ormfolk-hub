import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, url } = await request.json();
  if (!key || !url) {
    return NextResponse.json({ error: "Missing key or url" }, { status: 400 });
  }

  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: url },
    create: { key, value: url },
  });

  return NextResponse.json({ ok: true });
}
