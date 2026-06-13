import { prisma } from "@/lib/prisma";
import ForumClient from "./ForumClient";

export default async function ForumPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort = "latest" } = await searchParams;

  const orderBy: any = sort === "hot"
    ? [{ pinned: "desc" }, { likeCount: "desc" }, { commentCount: "desc" }]
    : [{ pinned: "desc" }, { createdAt: "desc" }];

  const [categories, latestPosts] = await Promise.all([
    prisma.forumCategory.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { posts: true } },
        children: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { posts: true } } } },
      },
    }),
    prisma.post.findMany({
      where: { deletedAt: null, reviewStatus: { not: "rejected" } },
      orderBy,
      take: 20,
      include: { author: true, category: true, tags: { include: { tag: true } } },
    }),
  ]);

  const serialized = {
    sort,
    categories: categories.map((c) => ({
      ...c,
      postCount: c._count.posts,
      createdAt: c.createdAt.toISOString(),
      children: c.children.map((ch) => ({
        ...ch,
        postCount: ch._count.posts,
        createdAt: ch.createdAt.toISOString(),
      })),
    })),
    latestPosts: latestPosts.map((p) => ({
      id: p.id, title: p.title, content: p.content, categoryId: p.categoryId,
      likeCount: p.likeCount, commentCount: p.commentCount, viewCount: p.viewCount,
      pinned: p.pinned, essence: p.essence,
      tags: p.tags.map((pt) => pt.tag.name),
      createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
      author: p.author
        ? { id: p.author.id, name: p.author.name, username: p.author.username, level: p.author.level }
        : null,
      category: p.category
        ? { id: p.category.id, slug: p.category.slug, nameEn: p.category.nameEn, nameZh: p.category.nameZh, nameTh: p.category.nameTh }
        : null,
    })),
  };

  return <ForumClient data={serialized} />;
}
