import { prisma } from "@/lib/prisma";
import CategoryClient from "./CategoryClient";
import { notFound } from "next/navigation";

export default async function ForumCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.forumCategory.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { deletedAt: null, reviewStatus: { not: "rejected" } },
        orderBy: { createdAt: "desc" },
        include: { author: true, tags: { include: { tag: true } } },
      },
      _count: { select: { posts: { where: { deletedAt: null, reviewStatus: { not: "rejected" } } } } },
    },
  });

  if (!category) notFound();

  const serialized = {
    id: category.id,
    slug: category.slug,
    nameEn: category.nameEn,
    nameZh: category.nameZh,
    nameTh: category.nameTh,
    descriptionEn: category.descriptionEn,
    descriptionZh: category.descriptionZh,
    descriptionTh: category.descriptionTh,
    postCount: category._count.posts,
    posts: category.posts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      author: p.author
        ? { id: p.author.id, name: p.author.name, username: p.author.username }
        : null,
    })),
  };

  return <CategoryClient category={serialized} />;
}
