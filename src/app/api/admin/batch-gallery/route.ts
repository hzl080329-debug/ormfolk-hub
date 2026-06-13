import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

const genId = () => crypto.randomBytes(12).toString("hex");

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "superadmin", "founder"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { items } = await request.json();
    let count = 0;
    for (const item of items) {
      await prisma.galleryItem.upsert({
        where: { id: item.id || genId() },
        update: { url: item.url, caption: item.caption, tag: item.tag, category: item.category },
        create: {
          id: item.id || genId(),
          url: item.url,
          caption: item.caption || "",
          tag: item.tag || "both",
          category: item.category || "photo",
          featured: item.featured || false,
          reviewStatus: "approved",
          userId: session.user!.id!,
        }
      }).catch(() => {});
      count++;
    }
    return NextResponse.json({ ok: true, count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
