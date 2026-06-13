import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return NextResponse.json({ key, value: setting?.value || "" });
}
