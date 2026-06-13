import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EpisodeClient from "./EpisodeClient";

export default async function DramaDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const drama = await prisma.drama.findUnique({
    where: { id },
    include: { episodes: { orderBy: { episodeNum: "asc" } } },
  });
  if (!drama) notFound();

  const serialized = {
    id: drama.id,
    title: drama.title, titleZh: drama.titleZh, titleTh: drama.titleTh,
    description: drama.description, descriptionZh: drama.descriptionZh, descriptionTh: drama.descriptionTh,
    coverImage: drama.coverImage,
    episodes: drama.episodes.map(e => ({
      id: e.id, episodeNum: e.episodeNum,
      title: e.title, titleZh: e.titleZh, titleTh: e.titleTh,
      description: e.description, videoUrl: e.videoUrl, duration: e.duration,
      language: e.language || "zh",
    })),
  };

  return <EpisodeClient drama={serialized} />;
}
