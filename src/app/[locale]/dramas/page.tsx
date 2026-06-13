import { prisma } from "@/lib/prisma";
import DramasClient from "./DramasClient";

export default async function DramasPage() {
  const dramas = await prisma.drama.findMany({
    orderBy: { sortOrder: "asc" },
    include: { episodes: { orderBy: { episodeNum: "asc" } } },
  });

  const serialized = dramas.map(d => ({
    id: d.id,
    title: d.title, titleZh: d.titleZh, titleTh: d.titleTh,
    description: d.description, descriptionZh: d.descriptionZh, descriptionTh: d.descriptionTh,
    coverImage: d.coverImage,
    episodeCount: d.episodes.length,
    updatedAt: d.episodes.length > 0
      ? d.episodes.reduce((max, e) => e.createdAt > max ? e.createdAt : max, d.episodes[0].createdAt).toISOString()
      : d.createdAt.toISOString(),
  }));

  return <DramasClient dramas={serialized} />;
}
