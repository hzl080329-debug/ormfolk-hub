import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "admin" && role !== "superadmin" && role !== "founder") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [
      users, posts, comments, creations, events, timelineEntries,
      wallMessages, galleryItems, announcements, categories, bannedWords,
      submissions, bookmarks, follows, reactions, reports, checkIns,
      notifications, achievements, adminLogs, siteSettings,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.post.findMany(),
      prisma.comment.findMany(),
      prisma.creation.findMany(),
      prisma.event.findMany(),
      prisma.timelineEntry.findMany(),
      prisma.wallMessage.findMany(),
      prisma.galleryItem.findMany({ include: { galleryTags: true } }),
      prisma.announcement.findMany(),
      prisma.forumCategory.findMany(),
      prisma.bannedWord.findMany(),
      prisma.submission.findMany(),
      prisma.bookmark.findMany(),
      prisma.follow.findMany(),
      prisma.reaction.findMany(),
      prisma.report.findMany(),
      prisma.checkIn.findMany(),
      prisma.notification.findMany(),
      prisma.achievement.findMany(),
      prisma.adminLog.findMany(),
      prisma.siteSetting.findMany(),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: {
        users: users.map(u => ({ ...u, password: "[REDACTED]", twoFactorSecret: null })),
        posts, comments, creations, events, timelineEntries,
        wallMessages, galleryItems, announcements, categories, bannedWords,
        submissions, bookmarks, follows, reactions, reports, checkIns,
        notifications, achievements, adminLogs, siteSettings,
      },
    };

    return NextResponse.json(backup, {
      headers: {
        "Content-Disposition": `attachment; filename="ormfolk-hub-backup-${new Date().toISOString().split("T")[0]}.json"`,
        "Content-Type": "application/json",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
