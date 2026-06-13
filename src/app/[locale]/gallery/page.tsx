import { prisma } from "@/lib/prisma";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 10000,
    include: { user: true, galleryTags: { include: { tag: true } } },
  });

  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  const serialized = items.map((g) => ({
    id: g.id,
    url: g.url,
    caption: g.caption,
    tag: g.tag,
    category: g.category,
    featured: g.featured,
    reviewStatus: g.reviewStatus,
    videoUrl: g.videoUrl,
    tags: g.galleryTags.map(gt => gt.tag.name),
    createdAt: g.createdAt.toISOString(),
    user: g.user ? { username: g.user.username } : null,
  }));
  const serializedTags = allTags.map(t => t.name);

  return <GalleryClient items={serialized} allTags={serializedTags} />;
}
