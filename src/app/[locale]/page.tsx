import HomeClient from "./HomeClient";

export default async function HomePage() {
  let data = {
    stats: { members: 0, posts: 0, creationsCount: 0, countries: 0, comments: 0 },
    timelineEntries: [] as any[],
    forumCategories: [] as any[],
    forumPosts: [] as any[],
    creations: [] as any[],
    events: [] as any[],
    wallMessages: [] as any[],
    announcements: [] as any[],
  };

  try {
    const { prisma } = await import("@/lib/prisma");
    const [timelineEntries, forumCategories, forumPosts, creations, events, wallMessages, announcements, stats] =
      await Promise.all([
        prisma.timelineEntry.findMany({ orderBy: { year: "desc" } }).catch(() => []),
        prisma.forumCategory.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []),
        prisma.post.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 5, include: { author: true, category: true, tags: { include: { tag: true } } } }).catch(() => []),
        prisma.creation.findMany({ orderBy: { createdAt: "desc" }, include: { author: true } }).catch(() => []),
        prisma.event.findMany({ orderBy: { date: "asc" } }).catch(() => []),
        prisma.wallMessage.findMany({ orderBy: { createdAt: "desc" }, take: 4 }).catch(() => []),
        prisma.announcement.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 5, include: { author: true } }).catch(() => []),
        Promise.all([
          prisma.user.count().catch(() => 0),
          prisma.post.count().catch(() => 0),
          prisma.creation.count().catch(() => 0),
          prisma.user.findMany({ where: { country: { not: null } }, select: { country: true }, distinct: ["country"] }).then(r => r.length).catch(() => 0),
          prisma.comment.count().catch(() => 0),
        ]).then(([members, posts, creationsCount, countries, comments]) => ({ members, posts, creationsCount, countries, comments })),
      ]);

    data = {
      stats,
      timelineEntries: (timelineEntries || []).map((t: any) => ({ ...t, createdAt: t.createdAt?.toISOString?.() || t.createdAt })),
      forumCategories: (forumCategories || []).map((c: any) => ({ ...c, createdAt: c.createdAt?.toISOString?.() || c.createdAt })),
      forumPosts: (forumPosts || []).map((p: any) => ({
        ...p,
        createdAt: p.createdAt?.toISOString?.() || p.createdAt,
        updatedAt: p.updatedAt?.toISOString?.() || p.updatedAt,
        author: p.author ? { id: p.author.id, username: p.author.username, name: p.author.name, image: p.author.image, level: p.author.level } : null,
      })),
      creations: (creations || []).map((c: any) => ({ ...c, createdAt: c.createdAt?.toISOString?.() || c.createdAt })),
      events: (events || []).map((e: any) => ({ ...e, createdAt: e.createdAt?.toISOString?.() || e.createdAt })),
      wallMessages: (wallMessages || []).map((w: any) => ({ ...w, createdAt: w.createdAt?.toISOString?.() || w.createdAt })),
      announcements: (announcements || []).map((a: any) => ({
        id: a.id, title: a.title, content: a.content, titleZh: a.titleZh, contentZh: a.contentZh,
        titleTh: a.titleTh, contentTh: a.contentTh, originalLang: a.originalLang,
        category: a.category, pinned: a.pinned,
        createdAt: a.createdAt?.toISOString?.() || a.createdAt,
        author: a.author ? { username: a.author.username } : null,
      })),
    };
  } catch (e) {
    console.error("Homepage data fetch failed, showing empty site:", e);
  }

  return <HomeClient data={data} />;
}
