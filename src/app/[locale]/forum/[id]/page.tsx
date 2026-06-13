import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PostDetailClient from "./PostDetailClient";
import { notFound } from "next/navigation";

export default async function ForumPostPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
      tags: { include: { tag: true } },
      event: true,
    },
  });

  if (!post) notFound();

  // Related posts (same category)
  const relatedPosts = await prisma.post.findMany({
    where: { categoryId: post.categoryId, id: { not: id }, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, title: true, likeCount: true, commentCount: true, createdAt: true },
  });

  // All categories for post editing
  const categories = await prisma.forumCategory.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });

  // Check if current user bookmarked
  let isBookmarked = false;
  if (session?.user?.id) {
    const bm = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: id } },
    });
    isBookmarked = !!bm;
  }

  const serialized = {
    ...post,
    viewCount: post.viewCount,
    isBookmarked,
    relatedPosts: relatedPosts.map(r => ({ id: r.id, title: r.title, likeCount: r.likeCount, commentCount: r.commentCount, createdAt: r.createdAt.toISOString() })),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author ? {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username,
      image: post.author.image,
      level: post.author.level,
      xp: post.author.xp,
    } : null,
    category: post.category ? {
      id: post.category.id,
      slug: post.category.slug,
      nameEn: post.category.nameEn,
      nameZh: post.category.nameZh,
      nameTh: post.category.nameTh,
    } : null,
    event: post.event ? { id: post.event.id, titleEn: post.event.titleEn, titleZh: post.event.titleZh, date: post.event.date } : null,
    tags: post.tags.map((pt) => pt.tag.name),
    comments: post.comments.map((c) => ({
      id: c.id,
      content: c.content,
      likeCount: c.likeCount,
      parentId: c.parentId,
      createdAt: c.createdAt.toISOString(),
      author: c.author ? {
        id: c.author.id,
        name: c.author.name,
        username: c.author.username,
        level: c.author.level,
      } : null,
    })),
  };

  const serializedCats = categories.map(c => ({
    id: c.id, slug: c.slug, nameEn: c.nameEn, nameZh: c.nameZh, nameTh: c.nameTh, sortOrder: c.sortOrder,
    children: c.children.map(ch => ({ id: ch.id, slug: ch.slug, nameEn: ch.nameEn, nameZh: ch.nameZh, nameTh: ch.nameTh, sortOrder: ch.sortOrder })),
  }));

  return <PostDetailClient post={serialized} categories={serializedCats} />;
}
