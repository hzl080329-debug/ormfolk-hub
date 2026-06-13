import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "admin" && role !== "superadmin" && role !== "founder" && role !== "moderator") redirect("/");

  const [
    users, posts, submissions, wallMessages, events, timelineEntries, galleryItems,
    announcements, categories, bannedWords, reviewQueue, adminLogs, drafts, copyrightReports,
    welcomeMsg, deletedPosts, translateAnns, translatePostsList, dramas, feedbacks,
  ] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.post.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 20, include: { author: true } }),
    prisma.submission.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } }),
    prisma.wallMessage.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.event.findMany({ orderBy: { date: "asc" } }),
    prisma.timelineEntry.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] }),
    prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" }, take: 10000, include: { user: true } }),
    prisma.announcement.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], include: { author: true } }),
    prisma.forumCategory.findMany({ orderBy: { sortOrder: "asc" }, include: { children: true } }),
    prisma.bannedWord.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.post.findMany({ where: { reviewStatus: "pending" }, orderBy: { createdAt: "desc" }, include: { author: true, category: true } }),
    prisma.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.draft.findMany({ orderBy: { updatedAt: "desc" }, take: 20, include: { user: { select: { username: true } } } }),
    prisma.copyrightReport.findMany({ orderBy: { createdAt: "desc" }, include: { reporter: { select: { username: true } } } }),
    prisma.welcomeMessage.findFirst({ where: { isActive: true } }),
    prisma.post.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" }, take: 20, include: { author: { select: { username: true } } } }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.post.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10, include: { author: { select: { username: true } } } }),
    prisma.drama.findMany({ orderBy: { sortOrder: "asc" }, include: { episodes: { orderBy: { episodeNum: "asc" } } } }),
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { username: true } } } }),
  ]);

  const translatableContent = {
    announcements: translateAnns.map((a: any) => ({ id: a.id, title: a.title, content: a.content, titleZh: a.titleZh, contentZh: a.contentZh, titleTh: a.titleTh, contentTh: a.contentTh })),
    posts: translatePostsList.map((p: any) => ({ id: p.id, title: p.title, content: p.content, titleZh: p.titleZh, contentZh: p.contentZh, titleTh: p.titleTh, contentTh: p.contentTh, author: p.author ? { username: p.author.username } : null })),
  };

  const stats = {
    totalUsers: await prisma.user.count(),
    totalPosts: await prisma.post.count({ where: { deletedAt: null } }),
    totalComments: await prisma.comment.count({ where: { deletedAt: null } }),
    totalCreations: await prisma.creation.count({ where: { deletedAt: null } }),
    totalGallery: await prisma.galleryItem.count(),
  };

  const serialized = {
    users: users.map((u) => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt.toISOString() })),
    posts: posts.map((p) => ({ id: p.id, title: p.title, createdAt: p.createdAt.toISOString(), author: p.author ? { id: p.author.id, username: p.author.username } : null })),
    submissions: submissions.map((s) => ({ ...s, createdAt: s.createdAt.toISOString(), user: s.user ? { id: s.user.id, username: s.user.username } : null })),
    wallMessages: wallMessages.map((w) => ({ id: w.id, content: w.content, username: w.username, createdAt: w.createdAt.toISOString() })),
    events: events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
    timelineEntries: timelineEntries.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    galleryItems: galleryItems.map((g) => ({ id: g.id, url: g.url, caption: g.caption, tag: g.tag, category: g.category, featured: g.featured, reviewStatus: g.reviewStatus, createdAt: g.createdAt.toISOString(), user: g.user ? { username: g.user.username } : null })),
    announcements: announcements.map((a) => ({ id: a.id, title: a.title, content: a.content, category: a.category, pinned: a.pinned, createdAt: a.createdAt.toISOString(), author: a.author ? { username: a.author.username } : null })),
    categories: categories.map((c) => ({ ...c, createdAt: c.createdAt.toISOString(), children: c.children.map((ch) => ({ ...ch, createdAt: ch.createdAt.toISOString() })) })),
    bannedWords: bannedWords.map((b) => ({ id: b.id, word: b.word, lang: b.lang, category: b.category })),
    reviewQueue: reviewQueue.map((p) => ({ id: p.id, title: p.title, content: p.content, reviewStatus: p.reviewStatus, createdAt: p.createdAt.toISOString(), author: p.author ? { id: p.author.id, username: p.author.username } : null, category: p.category ? { nameEn: p.category.nameEn } : null })),
    adminLogs: adminLogs.map((l) => ({ id: l.id, action: l.action, targetId: l.targetId, detail: l.detail, createdAt: l.createdAt.toISOString() })),
    drafts: drafts.map((d) => ({ id: d.id, title: d.title, content: d.content?.substring(0, 200), tags: d.tags, updatedAt: d.updatedAt.toISOString(), user: d.user ? { username: d.user.username } : null })),
    copyrightReports: copyrightReports.map((r) => ({ id: r.id, contentType: r.contentType, contentId: r.contentId, originalWork: r.originalWork, description: r.description, status: r.status, createdAt: r.createdAt.toISOString() })),
    welcomeMsg: welcomeMsg ? { contentEn: welcomeMsg.contentEn, contentZh: welcomeMsg.contentZh, contentZht: (welcomeMsg as any).contentZht || "", contentYue: (welcomeMsg as any).contentYue || "", contentTh: welcomeMsg.contentTh } : null,
    deletedPosts: deletedPosts.map((p) => ({ id: p.id, title: p.title, deletedAt: p.deletedAt!.toISOString(), author: p.author ? { username: p.author.username } : null })),
    translatableContent,
    stats,
    feedbacks: feedbacks.map((f) => ({
      id: f.id, type: f.type, subject: f.subject, message: f.message,
      contact: f.contact, status: f.status, createdAt: f.createdAt.toISOString(),
      user: f.user ? { username: f.user.username } : null,
    })),
    dramas: dramas.map((d) => ({
      id: d.id, title: d.title, titleZh: d.titleZh, titleTh: d.titleTh,
      description: d.description, coverImage: d.coverImage, sortOrder: d.sortOrder,
      episodes: d.episodes.map((e) => ({
        id: e.id, episodeNum: e.episodeNum,
        title: e.title, titleZh: e.titleZh, titleTh: e.titleTh,
        description: e.description, videoUrl: e.videoUrl, duration: e.duration,
        language: e.language,
      })),
    })),
  };

  return <AdminClient data={serialized} />;
}
