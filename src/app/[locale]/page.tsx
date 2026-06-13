import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  // Fetch real data from database + stats
  const [timelineEntries, forumCategories, forumPosts, creations, events, wallMessages, announcements, stats] =
    await Promise.all([
      prisma.timelineEntry.findMany({ orderBy: { year: "desc" } }),
      prisma.forumCategory.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.post.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 5, include: { author: true, category: true, tags: { include: { tag: true } } } }),
      prisma.creation.findMany({ orderBy: { createdAt: "desc" }, include: { author: true } }),
      prisma.event.findMany({ orderBy: { date: "asc" } }),
      prisma.wallMessage.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
      prisma.announcement.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 5, include: { author: true } }),
      Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.creation.count(),
        prisma.user.findMany({ where: { country: { not: null } }, select: { country: true }, distinct: ["country"] }).then(r => r.length),
        prisma.comment.count(),
      ]).then(([members, posts, creationsCount, countries, comments]) => ({ members, posts, creationsCount, countries, comments })),
    ]);

  // Serialize dates for client components
  const serialized = {
    stats,
    timelineEntries: timelineEntries.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })),
    forumCategories: forumCategories.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    forumPosts: forumPosts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      author: p.author ? { id: p.author.id, username: p.author.username, name: p.author.name, image: p.author.image, level: p.author.level } : null,
    })),
    creations: creations.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    events: events.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    wallMessages: wallMessages.map((w) => ({
      ...w,
      createdAt: w.createdAt.toISOString(),
    })),
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      titleZh: a.titleZh,
      contentZh: a.contentZh,
      titleTh: a.titleTh,
      contentTh: a.contentTh,
      originalLang: a.originalLang,
      category: a.category,
      pinned: a.pinned,
      createdAt: a.createdAt.toISOString(),
      author: a.author ? { username: a.author.username } : null,
    })),
  };

  return <HomeClient data={serialized} />;
}
