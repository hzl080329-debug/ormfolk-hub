import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const announcement = await prisma.announcement.findFirst({
    where: { pinned: true },
    orderBy: { createdAt: "desc" },
  });

  if (!announcement) {
    return NextResponse.json({});
  }

  return NextResponse.json({
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    titleZh: announcement.titleZh,
    titleTh: announcement.titleTh,
    contentZh: announcement.contentZh,
    contentTh: announcement.contentTh,
  });
}
